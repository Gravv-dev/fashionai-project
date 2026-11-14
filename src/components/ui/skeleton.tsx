"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const skeletonVariants = cva("animate-pulse rounded-md bg-surface-muted", {
  variants: {
    variant: {
      default: "h-full w-full",
      text: "h-4 w-full max-w-xs",
      circle: "h-8 w-8 rounded-full",
      rect: "h-8 w-32",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading..."
        className={cn(skeletonVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton, skeletonVariants };
