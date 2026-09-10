import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { tasksService } from '../../services/tasks.service';
import { subjectsService } from '../../services/subjects.service';
import { getErrorMessage } from '../../services/api';
import type { Task, TaskStatus, TaskPriority, Subject } from '../../types/models';
import styles from './TaskFormModal.module.css';

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'A fazer' },
  { value: 'IN_PROGRESS', label: 'Em progresso' },
  { value: 'COMPLETED', label: 'Concluída' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
];

type Props = {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSaved: () => void;
};

/** Converte ISO string para formato aceito pelo input datetime-local */
function toInputDateTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TaskFormModal({ open, task, onClose, onSaved }: Props) {
  const isEditing = !!task;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    subjectsService.list().then(setSubjects).catch(() => {});
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setSubjectId(task.subjectId ?? '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(toInputDateTime(task.dueDate));
    } else {
      setTitle('');
      setDescription('');
      setSubjectId('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setDueDate('');
    }
    setError('');
  }, [open, task]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: subjectId || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };
      if (isEditing) {
        await tasksService.update(task.id, payload);
      } else {
        await tasksService.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar tarefa' : 'Nova tarefa'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="task-form" loading={loading}>
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <ErrorMessage message={error} />}

        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={2}
          maxLength={120}
          autoFocus
        />

        <Textarea
          label="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={3}
        />

        <Select
          label="Matéria (opcional)"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          options={[
            { value: '', label: 'Sem matéria' },
            ...subjects.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />

        <div className={styles.row}>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Prioridade"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={PRIORITY_OPTIONS}
          />
        </div>

        <Input
          label="Data de vencimento (opcional)"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </form>
    </Modal>
  );
}