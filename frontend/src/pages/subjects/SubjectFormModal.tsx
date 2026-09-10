import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { subjectsService } from '../../services/subjects.service';
import { getErrorMessage } from '../../services/api';
import type { Subject } from '../../types/models';
import styles from './SubjectFormModal.module.css';

const DEFAULT_COLOR = '#6366f1';

const PRESET_COLORS = [
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#06b6d4', // cyan
];

type Props = {
  open: boolean;
  subject: Subject | null;
  onClose: () => void;
  onSaved: () => void;
};

export function SubjectFormModal({ open, subject, onClose, onSaved }: Props) {
  const isEditing = !!subject;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (subject) {
      setName(subject.name);
      setDescription(subject.description ?? '');
      setColor(subject.color);
    } else {
      setName('');
      setDescription('');
      setColor(DEFAULT_COLOR);
    }
    setError('');
  }, [open, subject]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      };
      if (isEditing) {
        await subjectsService.update(subject.id, payload);
      } else {
        await subjectsService.create(payload);
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
      title={isEditing ? 'Editar matéria' : 'Nova matéria'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="subject-form" loading={loading}>
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      <form id="subject-form" onSubmit={handleSubmit} className={styles.form}>
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

        <div className={styles.colorField}>
          <label className={styles.colorLabel}>Cor</label>
          <div className={styles.colorRow}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.colorSwatch} ${color === c ? styles.selected : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Cor ${c}`}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={styles.customColor}
              title="Cor personalizada"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}