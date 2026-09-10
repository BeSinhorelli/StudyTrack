import { Badge } from '../../components/ui/Badge';
import type { TopicStatus } from '../../types/models';

const MAP: Record<TopicStatus, { label: string; variant: 'default' | 'warning' | 'success' }> = {
  NOT_STARTED: { label: 'Não iniciado', variant: 'default' },
  IN_PROGRESS: { label: 'Em progresso', variant: 'warning' },
  COMPLETED: { label: 'Concluído', variant: 'success' },
};

export function TopicStatusBadge({ status }: { status: TopicStatus }) {
  const { label, variant } = MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}