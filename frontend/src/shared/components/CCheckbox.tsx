import * as React from 'react';
import { Checkbox } from '@/shared/ui/checkbox';

export type CCheckboxProps = React.ComponentPropsWithoutRef<typeof Checkbox>;

export const CCheckbox = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  CCheckboxProps
>(({ ...props }, ref) => <Checkbox ref={ref} {...props} />);
CCheckbox.displayName = 'CCheckbox';
