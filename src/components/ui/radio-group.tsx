"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn("flex flex-col gap-8", className)}
      {...props}
    />
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> &
    VariantProps<typeof radioGroupItemVariants>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioGroupItemVariants(), className)}
      {...props}
    />
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

const radioGroupItemVariants = cva(
  "flex items-center gap-2 text-sm outline-none data-[state=checked]:bg-brand data-[state=checked]:text-brand-foreground data-[state=unchecked]:bg-background"
);

const RadioGroupIndicator = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Indicator>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Indicator
      ref={ref}
      className={cn(
        "shrink-0 h-4 w-4 rounded-full border border-input",
        className
      )}
      {...props}
    />
  );
});
RadioGroupIndicator.displayName = "RadioGroupIndicator";

export {
  RadioGroup,
  RadioGroupItem,
  RadioGroupIndicator,
  radioGroupItemVariants,
};
