import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { topicsService } from '../../services/topics.service';
import { getErrorMessage } from '../../services/api';
import type { Topic, TopicStatus } from '../../types/models';
import styles from './TopicFormModal.module.css';

const STATUS_OPTIONS = [
  { value: 'NOT_STARTED', label: 'Não iniciado' },
  { value: 'IN_PROGRESS', label: 'Em progresso' },
  { value: 'COMPLETED', label: 'Concluído' },
];

type Props = {
  open: boolean;
  subjectId: string;
  topic: Topic | null;
  onClose: () => void;
  onSaved: (action: 'create' | 'edit') => void;
};

export function TopicFormModal({ open, subjectId, topic, onClose, onSaved }: Props) {
  const isEditing = !!topic;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TopicStatus>('NOT_STARTED');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (topic) {
      setName(topic.name);
      setDescription(topic.description ?? '');
      setStatus(topic.status);
    } else {
      setName('');
      setDescription('');
      setStatus('NOT_STARTED');
    }
    setError('');
  }, [open, topic]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEditing) {
        await topicsService.update(topic.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          status,
        });
        onSaved('edit');
      } else {
        await topicsService.create({
          subjectId,
          name: name.trim(),
          description: description.trim() || undefined,
          status,
        });
        onSaved('create');
      }
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
      title={isEditing ? 'Editar tópico' : 'Novo tópico'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="topic-form" loading={loading}>
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      <form id="topic-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <ErrorMessage message={error} />}

        <Input
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={80}
          autoFocus
        />

        <Textarea
          label="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
        />

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TopicStatus)}
          options={STATUS_OPTIONS}
        />
      </form>
    </Modal>
  );
}