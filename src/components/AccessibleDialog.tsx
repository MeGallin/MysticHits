import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AccessibleDialogProps {
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * An accessible dialog component that follows best practices for accessibility
 * Includes required DialogTitle and optional DialogDescription for screen readers
 */
export function AccessibleDialog({
  trigger = 'Open Dialog',
  title,
  description,
  children,
  footer,
}: AccessibleDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {typeof trigger === 'string' ? <Button>{trigger}</Button> : trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {/* DialogTitle is required for accessibility */}
          <DialogTitle>{title}</DialogTitle>
          {/* DialogDescription is recommended for additional context */}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Main dialog content */}
        <div className="py-4">{children}</div>

        {/* Optional footer */}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export default AccessibleDialog;
