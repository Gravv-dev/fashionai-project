"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface ProgressStepProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
  className?: string;
}

export function ProgressStep({
  currentStep,
  totalSteps,
  labels,
  className,
}: ProgressStepProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          return (
            <React.Fragment key={step}>
              <div className="relative z-10 flex h-8 w-8 flex-col items-center justify-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    isCompleted
                      ? "bg-success border-success"
                      : isActive
                        ? "bg-brand border-brand"
                        : "border-border bg-background"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-bold transition-colors",
                      isCompleted || isActive
                        ? "text-text-inverse"
                        : "text-text-muted"
                    )}
                  >
                    {step}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    isCompleted || isActive
                      ? "text-text-primary"
                      : "text-text-muted"
                  )}
                >
                  {labels[i]}
                </span>
              </div>
              {step < totalSteps && (
                <div
                  className={cn(
                    "flex h-1 w-full items-center",
                    isCompleted ? "bg-success" : "bg-border"
                  )}
                >
                  {isCompleted ? (
                    <ChevronRight className="h-3 w-3 text-text-inverse rotate-45" />
                  ) : null}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
