import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { goalsService } from '../../services/goals.service';
import { subjectsService } from '../../services/subjects.service';
import { getErrorMessage } from '../../services/api';
import type { Goal, Subject } from '../../types/models';
import styles from './GoalFormModal.module.css';

type Props = {
  open: boolean;
  goal: Goal | null;
  onClose: () => void;
  onSaved: () => void;
};

function toInputDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function defaultDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return toInputDate(d.toISOString());
}

export function GoalFormModal({ open, goal, onClose, onSaved }: Props) {
  const isEditing = !!goal;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState('');
  const [targetHours, setTargetHours] = useState('10');
  const [subjectId, setSubjectId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    subjectsService.list().then(setSubjects).catch(() => {});
    if (goal) {
      setTitle(goal.title);
      setTargetHours(String(goal.targetHours));
      setSubjectId(goal.subjectId ?? '');
      setDeadline(toInputDate(goal.deadline));
    } else {
      setTitle('');
      setTargetHours('10');
      setSubjectId('');
      setDeadline(defaultDeadline());
    }
    setError('');
  }, [open, goal]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const hours = parseFloat(targetHours);
      if (isNaN(hours) || hours <= 0) {
        setError('Horas-alvo deve ser um número positivo');
        setLoading(false);
        return;
      }
      const payload = {
        title: title.trim(),
        targetHours: hours,
        subjectId: subjectId || null,
        deadline: new Date(`${deadline}T23:59:59`).toISOString(),
      };
      if (isEditing) {
        await goalsService.update(goal.id, payload);
      } else {
        await goalsService.create(payload);
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
      title={isEditing ? 'Editar meta' : 'Nova meta'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="goal-form" loading={loading}>
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      <form id="goal-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <ErrorMessage message={error} />}

        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={2}
          maxLength={120}
          placeholder="Ex: Estudar 20h de TypeScript"
          autoFocus
        />

        <div className={styles.row}>
          <Input
            label="Horas-alvo"
            type="number"
            min="0.5"
            step="0.5"
            value={targetHours}
            onChange={(e) => setTargetHours(e.target.value)}
            required
          />
          <Input
            label="Prazo"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>

        <Select
          label="Matéria (opcional)"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          options={[
            { value: '', label: 'Todas as matérias' },
            ...subjects.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />

        <p className={styles.hint}>
          💡 O progresso é calculado automaticamente com base nas suas sessões de estudo.
          {subjectId ? ' Só sessões dessa matéria contam.' : ' Todas as suas sessões contam.'}
        </p>
      </form>
    </Modal>
  );
}