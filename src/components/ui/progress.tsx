"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const progressVariants = cva(
  "h-2 w-full overflow-hidden rounded-full border border-border bg-surface-muted",
  {
    variants: {
      variant: {
        default: "h-2 w-full overflow-hidden rounded-full border border-border bg-surface-muted",
        brand:
          "h-2 w-full overflow-hidden rounded-full border border-border bg-brand",
        accent:
          "h-2 w-full overflow-hidden rounded-full border border-border bg-accent",
        success:
          "h-2 w-full overflow-hidden rounded-full border border-border bg-success",
        warning:
          "h-2 w-full overflow-hidden rounded-full border border-border bg-warning",
        error:
          "h-2 w-full overflow-hidden rounded-full border border-border bg-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, variant, value, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(progressVariants({ variant }), className)}
        {...props}
      >
        <div
          className="h-full bg-brand transition-all duration-300"
          style={{ width: `${value ?? 0}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress, progressVariants };
