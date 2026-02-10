import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';

export type CCardProps = React.ComponentPropsWithoutRef<typeof Card>;
export type CCardHeaderProps = React.ComponentPropsWithoutRef<typeof CardHeader>;
export type CCardTitleProps = React.ComponentPropsWithoutRef<typeof CardTitle>;
export type CCardDescriptionProps = React.ComponentPropsWithoutRef<typeof CardDescription>;
export type CCardContentProps = React.ComponentPropsWithoutRef<typeof CardContent>;
export type CCardFooterProps = React.ComponentPropsWithoutRef<typeof CardFooter>;

export const CCard = React.forwardRef<React.ElementRef<typeof Card>, CCardProps>(
  ({ ...props }, ref) => <Card ref={ref} {...props} />
);
CCard.displayName = 'CCard';

export const CCardHeader = React.forwardRef<
  React.ElementRef<typeof CardHeader>,
  CCardHeaderProps
>(({ ...props }, ref) => <CardHeader ref={ref} {...props} />);
CCardHeader.displayName = 'CCardHeader';

export const CCardTitle = React.forwardRef<
  React.ElementRef<typeof CardTitle>,
  CCardTitleProps
>(({ ...props }, ref) => <CardTitle ref={ref} {...props} />);
CCardTitle.displayName = 'CCardTitle';

export const CCardDescription = React.forwardRef<
  React.ElementRef<typeof CardDescription>,
  CCardDescriptionProps
>(({ ...props }, ref) => <CardDescription ref={ref} {...props} />);
CCardDescription.displayName = 'CCardDescription';

export const CCardContent = React.forwardRef<
  React.ElementRef<typeof CardContent>,
  CCardContentProps
>(({ ...props }, ref) => <CardContent ref={ref} {...props} />);
CCardContent.displayName = 'CCardContent';

export const CCardFooter = React.forwardRef<
  React.ElementRef<typeof CardFooter>,
  CCardFooterProps
>(({ ...props }, ref) => <CardFooter ref={ref} {...props} />);
CCardFooter.displayName = 'CCardFooter';
