import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { sessionsService } from '../../services/sessions.service';
import { subjectsService } from '../../services/subjects.service';
import { topicsService } from '../../services/topics.service';
import { getErrorMessage } from '../../services/api';
import { formatMinutes } from '../../utils/format';
import type { StudySession, Subject, Topic } from '../../types/models';
import styles from './SessionFormModal.module.css';

type Props = {
  open: boolean;
  session: StudySession | null;
  onClose: () => void;
  onSaved: () => void;
};

function toInputDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowInput(): string {
  return toInputDateTime(new Date().toISOString());
}

function oneHourAgoInput(): string {
  const d = new Date();
  d.setHours(d.getHours() - 1);
  return toInputDateTime(d.toISOString());
}

export function SessionFormModal({ open, session, onClose, onSaved }: Props) {
  const isEditing = !!session;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [endedAt, setEndedAt] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega matérias quando abre
  useEffect(() => {
    if (!open) return;
    subjectsService.list().then(setSubjects).catch(() => {});
  }, [open]);

  // Carrega tópicos quando a matéria muda
  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      return;
    }
    topicsService.list(subjectId).then(setTopics).catch(() => {});
  }, [subjectId]);

  // Preenche form
  useEffect(() => {
    if (!open) return;
    if (session) {
      setSubjectId(session.subjectId);
      setTopicId(session.topicId ?? '');
      setStartedAt(toInputDateTime(session.startedAt));
      setEndedAt(toInputDateTime(session.endedAt));
      setNotes(session.notes ?? '');
    } else {
      setSubjectId('');
      setTopicId('');
      setStartedAt(oneHourAgoInput());
      setEndedAt(nowInput());
      setNotes('');
    }
    setError('');
  }, [open, session]);

  // Duração em tempo real (feedback visual)
  const durationLabel = (() => {
    if (!startedAt || !endedAt) return null;
    const diffMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    if (diffMs <= 0) return 'Inválido';
    return formatMinutes(Math.round(diffMs / 60000));
  })();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        subjectId,
        topicId: topicId || null,
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        notes: notes.trim() || undefined,
      };
      if (isEditing) {
        await sessionsService.update(session.id, payload);
      } else {
        await sessionsService.create(payload);
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
      title={isEditing ? 'Editar sessão' : 'Nova sessão de estudo'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="session-form" loading={loading}>
            {isEditing ? 'Salvar' : 'Registrar'}
          </Button>
        </>
      }
    >
      <form id="session-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <ErrorMessage message={error} />}

        <Select
          label="Matéria"
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setTopicId('');
          }}
          required
          options={[
            { value: '', label: 'Selecione uma matéria' },
            ...subjects.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />

        <Select
          label="Tópico (opcional)"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          disabled={!subjectId || topics.length === 0}
          options={[
            { value: '', label: topics.length === 0 ? 'Sem tópicos nesta matéria' : 'Sem tópico' },
            ...topics.map((t) => ({ value: t.id, label: t.name })),
          ]}
        />

        <div className={styles.row}>
          <Input
            label="Início"
            type="datetime-local"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            required
          />
          <Input
            label="Fim"
            type="datetime-local"
            value={endedAt}
            onChange={(e) => setEndedAt(e.target.value)}
            required
          />
        </div>

        {durationLabel && (
          <div className={styles.duration}>
            Duração: <strong>{durationLabel}</strong>
          </div>
        )}

        <Textarea
          label="Notas (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
          rows={3}
        />
      </form>
    </Modal>
  );
}