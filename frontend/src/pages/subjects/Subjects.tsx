import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectsService } from '../../services/subjects.service';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/feedback/Loading';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SubjectFormModal } from './SubjectFormModal';
import type { Subject } from '../../types/models';
import styles from './Subjects.module.css';

export function Subjects() {
  const navigate = useNavigate();
  const toast = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);

  const [deleting, setDeleting] = useState<Subject | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setSubjects(await subjectsService.list());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(s: Subject) {
    setEditing(s);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await subjectsService.remove(deleting.id);
      toast.success(`Matéria "${deleting.name}" excluída`);
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Matérias"
        subtitle="Suas áreas de estudo"
        action={<Button onClick={openCreate}>+ Nova matéria</Button>}
      />

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon="📚"
          title="Nenhuma matéria ainda"
          description="Crie sua primeira matéria para começar a organizar seus estudos."
          action={<Button onClick={openCreate}>+ Criar matéria</Button>}
        />
      ) : (
        <div className={styles.grid}>
          {subjects.map((s) => (
            <Card key={s.id} className={styles.card}>
              <div className={styles.colorBar} style={{ background: s.color }} />
              <div className={styles.cardBody}>
                <h3 className={styles.name}>{s.name}</h3>
                {s.description && <p className={styles.description}>{s.description}</p>}
                <div className={styles.actions}>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/subjects/${s.id}`)}>
                    Ver detalhes
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>Editar</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(s)}>Excluir</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <SubjectFormModal
        open={formOpen}
        subject={editing}
        onClose={() => setFormOpen(false)}
        onSaved={async (action) => {
          setFormOpen(false);
          toast.success(action === 'edit' ? 'Matéria atualizada' : 'Matéria criada');
          await load();
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir matéria"
        message={`Tem certeza que deseja excluir "${deleting?.name}"? Essa ação não pode ser desfeita.`}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}