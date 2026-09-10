import { useEffect, useState } from 'react';
import { goalsService } from '../../services/goals.service';
import { getErrorMessage } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Loading } from '../../components/feedback/Loading';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { GoalFormModal } from './GoalFormModal';
import { formatDate, formatHours, daysUntil } from '../../utils/format';
import type { Goal } from '../../types/models';
import styles from './Goals.module.css';

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setGoals(await goalsService.list());
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
      await goalsService.remove(deleting.id);
      setDeleting(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Metas"
        subtitle="Acompanhe suas metas de estudo"
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            + Nova meta
          </Button>
        }
      />

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Nenhuma meta ainda"
          description="Crie uma meta para se desafiar. O progresso será calculado automaticamente conforme você estuda."
          action={
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              + Criar meta
            </Button>
          }
        />
      ) : (
        <div className={styles.list}>
          {goals.map((g) => {
            const days = daysUntil(g.deadline);
            const overdue = days < 0 && !g.completed;
            const nearDeadline = days >= 0 && days <= 3 && !g.completed;

            return (
              <Card key={g.id} className={styles.card}>
                <div className={styles.header}>
                  <div className={styles.titleArea}>
                    <h3 className={styles.title}>{g.title}</h3>
                    <div className={styles.badges}>
                      {g.completed && <Badge variant="success">Concluída</Badge>}
                      {overdue && <Badge variant="danger">Atrasada</Badge>}
                      {nearDeadline && <Badge variant="warning">Termina em breve</Badge>}
                      {!g.completed && !overdue && !nearDeadline && days > 0 && (
                        <Badge variant="default">{days} dias restantes</Badge>
                      )}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditing(g); setFormOpen(true); }}
                    >
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(g)}>
                      Excluir
                    </Button>
                  </div>
                </div>

                <div className={styles.progress}>
                  <div className={styles.progressHeader}>
                    <span>
                      <strong>{formatHours(g.hoursStudied)}</strong>
                      <span className="text-muted"> de {g.targetHours}h</span>
                    </span>
                    <span className={styles.percent}>{g.progressPercent.toFixed(0)}%</span>
                  </div>
                  <ProgressBar
                    value={g.progressPercent}
                    variant={g.completed ? 'success' : 'primary'}
                  />
                </div>

                <div className={styles.footer}>
                  <span className={styles.footerItem}>
                    📅 Prazo: {formatDate(g.deadline)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <GoalFormModal
        open={formOpen}
        goal={editing}
        onClose={() => setFormOpen(false)}
        onSaved={async () => {
          setFormOpen(false);
          await load();
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir meta"
        message={`Tem certeza que deseja excluir "${deleting?.title}"?`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}