"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> &
    VariantProps<typeof tooltipContentVariants>
>(({ className, sideOffset = 10, ...props }, ref) => {
  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        tooltipContentVariants(),
        "rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-text-primary shadow-md",
        className
      )}
      {...props}
    />
  );
});
TooltipContent.displayName = "TooltipContent";

const tooltipContentVariants = cva(
  "z-50 outline-none"
);

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  tooltipContentVariants,
};
