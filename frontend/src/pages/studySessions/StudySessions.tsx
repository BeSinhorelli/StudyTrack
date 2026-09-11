import { useEffect, useState } from 'react';
import { sessionsService } from '../../services/sessions.service';
import { subjectsService } from '../../services/subjects.service';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/feedback/Loading';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SessionFormModal } from './SessionFormModal';
import { formatDateTime, formatMinutes } from '../../utils/format';
import type { StudySession, Subject } from '../../types/models';
import styles from './StudySessions.module.css';

export function StudySessions() {
  const toast = useToast();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [filterSubject, setFilterSubject] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StudySession | null>(null);
  const [deleting, setDeleting] = useState<StudySession | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await sessionsService.list({
        subjectId: filterSubject || undefined,
        from: filterFrom ? new Date(filterFrom).toISOString() : undefined,
        to: filterTo ? new Date(`${filterTo}T23:59:59`).toISOString() : undefined,
      });
      setSessions(data);
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
  }, [filterSubject, filterFrom, filterTo]);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await sessionsService.remove(deleting.id);
      toast.success('Sessão excluída');
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  function clearFilters() {
    setFilterSubject('');
    setFilterFrom('');
    setFilterTo('');
  }

  const hasFilters = filterSubject || filterFrom || filterTo;
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <>
      <PageHeader
        title="Sessões de Estudo"
        subtitle={`${sessions.length} ${sessions.length === 1 ? 'sessão' : 'sessões'} • Total: ${formatMinutes(totalMinutes)}`}
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            + Nova sessão
          </Button>
        }
      />

      <Card className={styles.filters}>
        <Select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          options={[
            { value: '', label: 'Todas as matérias' },
            ...subjects.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
        <Input
          label="De"
          type="date"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
        />
        <Input
          label="Até"
          type="date"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </Card>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon="⏱️"
          title={hasFilters ? 'Nenhuma sessão com esses filtros' : 'Nenhuma sessão ainda'}
          description={
            hasFilters
              ? 'Tente ajustar os filtros.'
              : 'Registre sua primeira sessão de estudo para começar a acompanhar seu progresso.'
          }
          action={
            !hasFilters ? (
              <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
                + Registrar sessão
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={styles.list}>
          {sessions.map((s) => (
            <Card key={s.id} className={styles.row}>
              <div className={styles.left}>
                <span
                  className={styles.dot}
                  style={{ background: s.subject?.color ?? '#6366f1' }}
                />
                <div className={styles.info}>
                  <h3 className={styles.subjectName}>
                    {s.subject?.name ?? '—'}
                  </h3>
                  <span className={styles.time}>
                    {formatDateTime(s.startedAt)} → {formatDateTime(s.endedAt)}
                  </span>
                  {s.notes && <p className={styles.notes}>{s.notes}</p>}
                </div>
              </div>

              <div className={styles.right}>
                <span className={styles.duration}>
                  {formatMinutes(s.durationMinutes)}
                </span>
                <div className={styles.actions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditing(s); setFormOpen(true); }}
                  >
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(s)}>
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <SessionFormModal
        open={formOpen}
        session={editing}
        onClose={() => setFormOpen(false)}
        onSaved={async (action) => {
          setFormOpen(false);
          toast.success(action === 'edit' ? 'Sessão atualizada' : 'Sessão registrada');
          await load();
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir sessão"
        message={`Tem certeza que deseja excluir essa sessão de ${formatMinutes(deleting?.durationMinutes ?? 0)}?`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}