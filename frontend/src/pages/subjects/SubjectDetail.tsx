import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subjectsService } from '../../services/subjects.service';
import { topicsService } from '../../services/topics.service';
import { getErrorMessage } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/feedback/Loading';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TopicFormModal } from '../topics/TopicFormModal';
import { TopicStatusBadge } from '../topics/TopicStatusBadge';
import type { Subject, Topic } from '../../types/models';
import styles from './SubjectDetail.module.css';

export function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deleting, setDeleting] = useState<Topic | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [s, t] = await Promise.all([
        subjectsService.getById(id),
        topicsService.list(id),
      ]);
      setSubject(s);
      setTopics(t);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await topicsService.remove(deleting.id);
      setDeleting(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function cycleStatus(topic: Topic) {
    const next: Topic['status'] =
      topic.status === 'NOT_STARTED'
        ? 'IN_PROGRESS'
        : topic.status === 'IN_PROGRESS'
          ? 'COMPLETED'
          : 'NOT_STARTED';
    try {
      await topicsService.update(topic.id, { status: next });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!subject) return null;

  return (
    <>
      <PageHeader
        title={subject.name}
        subtitle={subject.description ?? 'Sem descrição'}
        action={
          <Button variant="secondary" onClick={() => navigate('/subjects')}>
            ← Voltar
          </Button>
        }
      />

      <Card className={styles.header}>
        <div className={styles.colorDot} style={{ background: subject.color }} />
        <div className={styles.meta}>
          <span className={styles.metaLabel}>Cor da matéria</span>
          <code className={styles.metaValue}>{subject.color}</code>
        </div>
      </Card>

      <div className={styles.topicsHeader}>
        <h2 className={styles.sectionTitle}>
          Tópicos <span className="text-muted">({topics.length})</span>
        </h2>
        <Button
          onClick={() => {
            setEditingTopic(null);
            setFormOpen(true);
          }}
        >
          + Novo tópico
        </Button>
      </div>

      {topics.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="Nenhum tópico ainda"
          description="Adicione tópicos para dividir essa matéria em partes menores."
          action={
            <Button onClick={() => { setEditingTopic(null); setFormOpen(true); }}>
              + Criar tópico
            </Button>
          }
        />
      ) : (
        <div className={styles.topicsList}>
          {topics.map((t) => (
            <Card key={t.id} className={styles.topicCard}>
              <div className={styles.topicLeft}>
                <button
                  type="button"
                  onClick={() => cycleStatus(t)}
                  className={styles.statusButton}
                  title="Clique para mudar o status"
                >
                  <TopicStatusBadge status={t.status} />
                </button>
                <div>
                  <h3 className={styles.topicName}>{t.name}</h3>
                  {t.description && (
                    <p className={styles.topicDescription}>{t.description}</p>
                  )}
                </div>
              </div>
              <div className={styles.topicActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTopic(t);
                    setFormOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleting(t)}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TopicFormModal
        open={formOpen}
        subjectId={subject.id}
        topic={editingTopic}
        onClose={() => setFormOpen(false)}
        onSaved={async () => {
          setFormOpen(false);
          await load();
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir tópico"
        message={`Tem certeza que deseja excluir "${deleting?.name}"?`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}