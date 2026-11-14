"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string; onClick?: () => void };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center text-center py-20", className)}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-muted max-w-xs">
        {description}
      </p>
      {action && (
        <Button
          className="mt-6"
          onClick={action.onClick}
          asChild
        >
          <a href={action.href}>{action.label}</a>
        </Button>
      )}
    </div>
  );
}

export const EmptyStates = {
  projects: (
    <EmptyState
      icon={<span className="h-6 w-6 text-text-muted">📁</span>}
      title="No projects yet"
      description="Create your first tech pack, flat sketch, or line sheet to get started."
      action={{ label: "Create Tech Pack", href: "/techpack" }}
    />
  ),
  flatSketches: (
    <EmptyState
      icon={<span className="h-6 w-6 text-text-muted">🖼️</span>}
      title="No flat sketches"
      description="Upload a garment photo to generate your first flat sketch."
      action={{ label: "Generate Flat Sketch", href: "/flatsketch" }}
    />
  ),
  lineSheets: (
    <EmptyState
      icon={<span className="h-6 w-6 text-text-muted">📋</span>}
      title="No line sheets"
      description="Build your first collection review sheet from saved flat sketches."
      action={{ label: "Create Line Sheet", href: "/line-sheet" }}
    />
  ),
};
