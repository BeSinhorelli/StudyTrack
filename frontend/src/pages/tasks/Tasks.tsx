import { useEffect, useState } from 'react';
import { tasksService } from '../../services/tasks.service';
import { subjectsService } from '../../services/subjects.service';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Loading } from '../../components/feedback/Loading';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TaskFormModal } from './TaskFormModal';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { formatDateTime, isOverdue } from '../../utils/format';
import type { Task, Subject, TaskStatus } from '../../types/models';
import styles from './Tasks.module.css';

export function Tasks() {
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterOverdue, setFilterOverdue] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await tasksService.list({
        status: filterStatus || undefined,
        subjectId: filterSubject || undefined,
        overdue: filterOverdue || undefined,
      });
      setTasks(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    subjectsService.list().then(setSubjects).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterSubject, filterOverdue]);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await tasksService.remove(deleting.id);
      toast.success(`Tarefa "${deleting.title}" excluída`);
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  const subjectName = (id: string | null) =>
    id ? subjects.find((s) => s.id === id)?.name ?? '—' : null;

  return (
    <>
      <PageHeader
        title="Tarefas"
        subtitle="Suas tarefas de estudo"
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            + Nova tarefa
          </Button>
        }
      />

      <Card className={styles.filters}>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')}
          options={[
            { value: '', label: 'Todos os status' },
            { value: 'TODO', label: 'A fazer' },
            { value: 'IN_PROGRESS', label: 'Em progresso' },
            { value: 'COMPLETED', label: 'Concluídas' },
            { value: 'CANCELLED', label: 'Canceladas' },
          ]}
        />
        <Select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          options={[
            { value: '', label: 'Todas as matérias' },
            ...subjects.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={filterOverdue}
            onChange={(e) => setFilterOverdue(e.target.checked)}
          />
          <span>Só atrasadas</span>
        </label>
      </Card>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="✅"
          title="Nenhuma tarefa"
          description={
            filterStatus || filterSubject || filterOverdue
              ? 'Nenhuma tarefa encontrada com esses filtros.'
              : 'Crie sua primeira tarefa para começar a organizar seus estudos.'
          }
          action={
            !filterStatus && !filterSubject && !filterOverdue ? (
              <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
                + Criar tarefa
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={styles.list}>
          {tasks.map((t) => {
            const overdue = isOverdue(t.dueDate, t.status);
            return (
              <Card
                key={t.id}
                className={`${styles.row} ${overdue ? styles.rowOverdue : ''}`}
              >
                <div className={styles.left}>
                  <div className={styles.titleRow}>
                    <h3 className={styles.title}>{t.title}</h3>
                    {overdue && <span className={styles.overdueTag}>Atrasada</span>}
                  </div>
                  {t.description && (
                    <p className={styles.description}>{t.description}</p>
                  )}
                  <div className={styles.meta}>
                    {subjectName(t.subjectId) && (
                      <span className={styles.metaItem}>
                        📚 {subjectName(t.subjectId)}
                      </span>
                    )}
                    {t.dueDate && (
                      <span className={styles.metaItem}>
                        🗓️ {formatDateTime(t.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.right}>
                  <div className={styles.badges}>
                    <TaskStatusBadge status={t.status} />
                    <TaskPriorityBadge priority={t.priority} />
                  </div>
                  <div className={styles.actions}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditing(t); setFormOpen(true); }}
                    >
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(t)}>
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <TaskFormModal
        open={formOpen}
        task={editing}
        onClose={() => setFormOpen(false)}
        onSaved={async (action) => {
          setFormOpen(false);
          toast.success(action === 'edit' ? 'Tarefa atualizada' : 'Tarefa criada');
          await load();
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir tarefa"
        message={`Tem certeza que deseja excluir "${deleting?.title}"?`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}