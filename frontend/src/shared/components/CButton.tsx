import * as React from 'react';
import { Button, type ButtonProps } from '@/shared/ui/button';

export type CButtonProps = ButtonProps;

export const CButton = React.forwardRef<HTMLButtonElement, CButtonProps>(
  ({ ...props }, ref) => <Button ref={ref} {...props} />
);
CButton.displayName = 'CButton';
