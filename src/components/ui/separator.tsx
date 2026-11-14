"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { type VariantProps } from "class-variance-authority";

const separatorVariants = cva(
  "mx-auto shrink-0 border-border",
  {
    variants: {
      orientation: {
        horizontal: "w-full h-[1px]",
        vertical: "h-full w-[1px]",
      },
      variant: {
        default: "",
        muted: "border-border/50",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      variant: "default",
    },
  }
);

export interface SeparatorProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    "orientation"
  >,
    VariantProps<typeof separatorVariants> {}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, orientation, variant, ...props }, ref) => {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      className={cn(separatorVariants({ orientation, variant, className }))}
      {...props}
    />
  );
});
Separator.displayName = "Separator";

export { Separator, separatorVariants };
