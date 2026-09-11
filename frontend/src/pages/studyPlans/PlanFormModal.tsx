import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { plansService } from '../../services/plans.service';
import { getErrorMessage } from '../../services/api';
import type { StudyPlan } from '../../types/models';
import styles from './PlanFormModal.module.css';

type Props = {
  open: boolean;
  plan: StudyPlan | null;
  onClose: () => void;
  onSaved: (action: 'create' | 'edit') => void;
};

function toInputDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayInput(): string {
  return toInputDate(new Date().toISOString());
}

function in30DaysInput(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return toInputDate(d.toISOString());
}

export function PlanFormModal({ open, plan, onClose, onSaved }: Props) {
  const isEditing = !!plan;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (plan) {
      setTitle(plan.title);
      setDescription(plan.description ?? '');
      setStartDate(toInputDate(plan.startDate));
      setEndDate(toInputDate(plan.endDate));
    } else {
      setTitle('');
      setDescription('');
      setStartDate(todayInput());
      setEndDate(in30DaysInput());
    }
    setError('');
  }, [open, plan]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: new Date(`${startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${endDate}T23:59:59`).toISOString(),
      };
      if (isEditing) {
        await plansService.update(plan.id, payload);
        onSaved('edit');
      } else {
        await plansService.create(payload);
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
      title={isEditing ? 'Editar plano' : 'Novo plano de estudo'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="plan-form" loading={loading}>
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      <form id="plan-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <ErrorMessage message={error} />}

        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={2}
          maxLength={120}
          placeholder="Ex: Aprender TypeScript avançado"
          autoFocus
        />

        <Textarea
          label="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={3}
        />

        <div className={styles.row}>
          <Input
            label="Início"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="Fim"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}