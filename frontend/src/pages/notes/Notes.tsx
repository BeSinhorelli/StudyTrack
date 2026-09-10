import { useEffect, useState } from 'react';
import { notesService } from '../../services/notes.service';
import { subjectsService } from '../../services/subjects.service';
import { getErrorMessage } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Loading } from '../../components/feedback/Loading';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { NoteFormModal } from './NoteFormModal';
import { formatDate } from '../../utils/format';
import type { Note, Subject } from '../../types/models';
import styles from './Notes.module.css';

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState<Note | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setNotes(await notesService.list({ subjectId: filterSubject || undefined }));
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
  }, [filterSubject]);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await notesService.remove(deleting.id);
      setDeleting(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
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
        title="Anotações"
        subtitle="Suas notas de estudo"
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            + Nova anotação
          </Button>
        }
      />

      <div className={styles.filter}>
        <Select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          options={[
            { value: '', label: 'Todas as matérias' },
            ...subjects.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : notes.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Nenhuma anotação ainda"
          description="Registre o que você aprendeu para revisar depois."
          action={
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              + Criar anotação
            </Button>
          }
        />
      ) : (
        <div className={styles.grid}>
          {notes.map((n) => (
            <Card key={n.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.title}>{n.title}</h3>
                <span className={styles.date}>{formatDate(n.updatedAt)}</span>
              </div>
              {subjectName(n.subjectId) && (
                <span className={styles.subject}>{subjectName(n.subjectId)}</span>
              )}
              <p className={styles.content}>{n.content}</p>
              <div className={styles.actions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditing(n); setFormOpen(true); }}
                >
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleting(n)}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <NoteFormModal
        open={formOpen}
        note={editing}
        onClose={() => setFormOpen(false)}
        onSaved={async () => {
          setFormOpen(false);
          await load();
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir anotação"
        message={`Tem certeza que deseja excluir "${deleting?.title}"?`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}