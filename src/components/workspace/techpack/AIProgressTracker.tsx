"use client";

import * as React from "react";

interface AIProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  isComplete: boolean;
}

const STEP_LABELS: string[] = [
  "Uploading reference image",
  "Analyzing garment",
  "Identifying visual details",
  "Suggesting materials",
  "Preparing measurements",
  "Generating construction details",
  "Saving tech pack",
];

export function AIProgressTracker({
  currentStep,
  totalSteps = STEP_LABELS.length,
  stepLabels = STEP_LABELS,
  isComplete = false,
}: AIProgressTrackerProps) {
  const activeStep = Math.min(currentStep, totalSteps);
  const isDone = activeStep >= totalSteps || isComplete;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">
          AI Generation Progress
        </span>
        {isComplete ? (
          <span className="text-xs font-semibold text-brand">Complete</span>
        ) : (
          <span className="text-xs text-text-muted">
            {activeStep} / {totalSteps}
          </span>
        )}
      </div>
      <div className="relative h-10">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < activeStep;
          const isActive = step === activeStep && !isComplete;
          return (
            <React.Fragment key={step}>
              <div className="relative z-10 flex h-8 w-8 flex-col items-center justify-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-brand border-brand"
                      : isActive
                        ? "bg-brand border-brand animate-pulse"
                        : "border-border bg-background"
                  }`}
                >
                  <span className={`text-[10px] font-bold transition-colors ${
                    isCompleted || isActive
                      ? "text-text-inverse"
                      : "text-text-muted"
                  }`}>
                    {step}
                  </span>
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isCompleted || isActive ? "text-text-primary" : "text-text-muted"}`}>
                  {stepLabels[i]}
                </span>
              </div>
              {step < totalSteps && (
                <div
                  className={`flex h-1 w-full items-center ${isCompleted ? "bg-brand" : "bg-border"}`}
                >
                  {isCompleted ? (
                    <span className="h-3 w-3 text-text-inverse rotate-45">✓</span>
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
