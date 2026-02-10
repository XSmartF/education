import { Badge, type BadgeProps } from '@/shared/ui/badge';

export type CBadgeProps = BadgeProps;

export function CBadge({ ...props }: CBadgeProps) {
  return <Badge {...props} />;
}
