import { Badge } from '../../components/ui/Badge';
import type { TaskPriority } from '../../types/models';

const MAP: Record<TaskPriority, { label: string; variant: 'info' | 'warning' | 'danger' }> = {
  LOW: { label: 'Baixa', variant: 'info' },
  MEDIUM: { label: 'Média', variant: 'warning' },
  HIGH: { label: 'Alta', variant: 'danger' },
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const { label, variant } = MAP[priority];
  return <Badge variant={variant}>{label}</Badge>;
}