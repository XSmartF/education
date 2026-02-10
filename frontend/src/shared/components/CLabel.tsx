import * as React from 'react';
import { Label } from '@/shared/ui/label';

export type CLabelProps = React.ComponentPropsWithoutRef<typeof Label>;

export const CLabel = React.forwardRef<React.ElementRef<typeof Label>, CLabelProps>(
  ({ ...props }, ref) => <Label ref={ref} {...props} />
);
CLabel.displayName = 'CLabel';
