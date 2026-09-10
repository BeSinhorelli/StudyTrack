import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { topicsService } from '../../services/topics.service';
import { subjectsService } from '../../services/subjects.service';
import { getErrorMessage } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Loading } from '../../components/feedback/Loading';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { EmptyState } from '../../components/feedback/EmptyState';
import { TopicStatusBadge } from './TopicStatusBadge';
import type { Subject, Topic } from '../../types/models';
import styles from './Topics.module.css';

export function Topics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([subjectsService.list(), topicsService.list()])
      .then(([s, t]) => {
        setSubjects(s);
        setTopics(t);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    topicsService
      .list(filter || undefined)
      .then(setTopics)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filter]);

  const subjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name ?? '—';

  const subjectColor = (id: string) =>
    subjects.find((s) => s.id === id)?.color ?? '#6366f1';

  if (loading && topics.length === 0) return <Loading />;

  return (
    <>
      <PageHeader
        title="Tópicos"
        subtitle="Tópicos dentro de cada matéria"
      />

      <div className={styles.filter}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: '', label: 'Todas as matérias' },
            ...subjects.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
      </div>

      {error && <ErrorMessage message={error} />}

      {topics.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="Nenhum tópico"
          description="Adicione tópicos dentro de uma matéria para vê-los aqui."
        />
      ) : (
        <div className={styles.list}>
          {topics.map((t) => (
            <Card key={t.id} className={styles.row}>
              <div className={styles.left}>
                <span
                  className={styles.dot}
                  style={{ background: subjectColor(t.subjectId) }}
                />
                <div>
                  <h3 className={styles.name}>{t.name}</h3>
                  <Link
                    to={`/subjects/${t.subjectId}`}
                    className={styles.subjectLink}
                  >
                    {subjectName(t.subjectId)}
                  </Link>
                </div>
              </div>
              <TopicStatusBadge status={t.status} />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}