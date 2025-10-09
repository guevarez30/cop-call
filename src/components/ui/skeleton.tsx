import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const skeletonVariants = cva('animate-pulse bg-muted rounded-md', {
  variants: {
    variant: {
      default: '',
      text: 'h-4 w-full',
      title: 'h-8 w-3/4',
      avatar: 'h-12 w-12 rounded-full',
      button: 'h-10 w-24',
      card: 'h-32 w-full',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-live="polite"
        aria-busy="true"
        className={cn(skeletonVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

export { Skeleton, skeletonVariants };
