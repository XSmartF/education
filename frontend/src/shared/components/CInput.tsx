import * as React from 'react';
import { Input, type InputProps } from '@/shared/ui/input';

export type CInputProps = InputProps;

export const CInput = React.forwardRef<HTMLInputElement, CInputProps>(
  ({ ...props }, ref) => <Input ref={ref} {...props} />
);
CInput.displayName = 'CInput';
