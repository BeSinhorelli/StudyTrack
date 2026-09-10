import { Badge } from '../../components/ui/Badge';
import type { TaskStatus } from '../../types/models';

const MAP: Record<
  TaskStatus,
  { label: string; variant: 'default' | 'warning' | 'success' | 'danger' }
> = {
  TODO: { label: 'A fazer', variant: 'default' },
  IN_PROGRESS: { label: 'Em progresso', variant: 'warning' },
  COMPLETED: { label: 'Concluída', variant: 'success' },
  CANCELLED: { label: 'Cancelada', variant: 'danger' },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { label, variant } = MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}