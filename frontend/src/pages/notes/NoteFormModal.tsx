import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { notesService } from '../../services/notes.service';
import { subjectsService } from '../../services/subjects.service';
import { topicsService } from '../../services/topics.service';
import { getErrorMessage } from '../../services/api';
import type { Note, Subject, Topic } from '../../types/models';
import styles from './NoteFormModal.module.css';

type Props = {
  open: boolean;
  note: Note | null;
  onClose: () => void;
  onSaved: () => void;
};

export function NoteFormModal({ open, note, onClose, onSaved }: Props) {
  const isEditing = !!note;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    subjectsService.list().then(setSubjects).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      return;
    }
    topicsService.list(subjectId).then(setTopics).catch(() => {});
  }, [subjectId]);

  useEffect(() => {
    if (!open) return;
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSubjectId(note.subjectId ?? '');
      setTopicId(note.topicId ?? '');
    } else {
      setTitle('');
      setContent('');
      setSubjectId('');
      setTopicId('');
    }
    setError('');
  }, [open, note]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        subjectId: subjectId || null,
        topicId: topicId || null,
      };
      if (isEditing) {
        await notesService.update(note.id, payload);
      } else {
        await notesService.create(payload);
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
      title={isEditing ? 'Editar anotação' : 'Nova anotação'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="note-form" loading={loading}>
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      <form id="note-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <ErrorMessage message={error} />}

        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          autoFocus
        />

        <Textarea
          label="Conteúdo"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
        />

        <Select
          label="Matéria (opcional)"
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setTopicId('');
          }}
          options={[
            { value: '', label: 'Sem matéria' },
            ...subjects.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />

        {subjectId && topics.length > 0 && (
          <Select
            label="Tópico (opcional)"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            options={[
              { value: '', label: 'Sem tópico' },
              ...topics.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
        )}
      </form>
    </Modal>
  );
}