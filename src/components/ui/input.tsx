import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary/50',
  {
    variants: {
      variant: {
        default:
          'border-input bg-background hover:border-ring/50 focus-visible:border-primary focus-visible:ring-primary',
        error:
          'border-destructive bg-background hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive',
        success:
          'border-success bg-background hover:border-success focus-visible:border-success focus-visible:ring-success',
      },
      inputSize: {
        default: 'h-10 px-3 py-2 text-sm',
        sm: 'h-8 px-2 py-1 text-xs',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
