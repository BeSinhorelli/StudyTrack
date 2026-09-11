import { useEffect, useState } from 'react';
import { plansService } from '../../services/plans.service';
import { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/feedback/Loading';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PlanFormModal } from './PlanFormModal';
import { formatDate, daysUntil } from '../../utils/format';
import type { StudyPlan } from '../../types/models';
import styles from './StudyPlans.module.css';

export function StudyPlans() {
  const toast = useToast();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StudyPlan | null>(null);
  const [deleting, setDeleting] = useState<StudyPlan | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setPlans(await plansService.list());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await plansService.remove(deleting.id);
      toast.success(`Plano "${deleting.title}" excluído`);
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  function statusBadge(plan: StudyPlan) {
    const now = new Date();
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);

    if (now < start) return <Badge variant="info">Em breve</Badge>;
    if (now > end) return <Badge variant="default">Encerrado</Badge>;
    return <Badge variant="success">Em andamento</Badge>;
  }

  return (
    <>
      <PageHeader
        title="Planos de Estudo"
        subtitle="Organize seus objetivos por período"
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            + Novo plano
          </Button>
        }
      />

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : plans.length === 0 ? (
        <EmptyState
          icon="🗓️"
          title="Nenhum plano ainda"
          description="Crie um plano para organizar seus estudos em um período específico."
          action={
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              + Criar plano
            </Button>
          }
        />
      ) : (
        <div className={styles.grid}>
          {plans.map((p) => {
            const days = daysUntil(p.endDate);
            const inProgress =
              new Date() >= new Date(p.startDate) && new Date() <= new Date(p.endDate);

            return (
              <Card key={p.id} className={styles.card}>
                <div className={styles.header}>
                  <h3 className={styles.title}>{p.title}</h3>
                  {statusBadge(p)}
                </div>

                {p.description && (
                  <p className={styles.description}>{p.description}</p>
                )}

                <div className={styles.dates}>
                  <span>📅 {formatDate(p.startDate)} → {formatDate(p.endDate)}</span>
                  {inProgress && days >= 0 && (
                    <span className={styles.daysLeft}>
                      {days} {days === 1 ? 'dia restante' : 'dias restantes'}
                    </span>
                  )}
                </div>

                <div className={styles.actions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditing(p); setFormOpen(true); }}
                  >
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(p)}>
                    Excluir
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PlanFormModal
        open={formOpen}
        plan={editing}
        onClose={() => setFormOpen(false)}
        onSaved={async (action) => {
          setFormOpen(false);
          toast.success(action === 'edit' ? 'Plano atualizado' : 'Plano criado');
          await load();
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir plano"
        message={`Tem certeza que deseja excluir "${deleting?.title}"?`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}