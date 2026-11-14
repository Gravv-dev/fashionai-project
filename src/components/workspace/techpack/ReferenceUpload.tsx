"use client";

import { Image as ImageIcon, FileText, Plus } from "lucide-react";
import { FileUpload } from "@/components/shared/FileUpload";

export function ReferenceUpload({
  onFilesChange,
  disabled,
}: {
  onFilesChange?: (files: File[]) => void;
  disabled?: boolean;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-text-primary">Your design</h2>
      <p className="mt-1 text-sm text-text-muted">
        Start with a reference image or file.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface p-4 text-center hover:border-brand transition-colors"
          >
            <ImageIcon className="h-5 w-5 text-text-muted" />
            <span className="mt-1 text-xs text-text-secondary">
              Reference image
            </span>
            <span className="text-[10px] text-text-muted">
              Photo or flat sketch
            </span>
          </button>
          <button
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface p-4 text-center hover:border-brand transition-colors"
          >
            <FileText className="h-5 w-5 text-text-muted" />
            <span className="mt-1 text-xs text-text-secondary">
              Reference file
            </span>
            <span className="text-[10px] text-text-muted">
              Beta · PDF, AI, EPS
            </span>
          </button>
        </div>
        <div className="flex items-center gap-4 border-t border-border pt-4">
          <button
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-secondary hover:bg-surface transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Use an example image instead</span>
          </button>
          <FileUpload
            accept="image/*"
            maxSizeMB={5}
            disabled={disabled}
            onFilesChange={onFilesChange}
          />
        </div>
        <p className="mt-3 text-xs text-text-muted">
          JPG, PNG, WEBP · AI, EPS, PDF
        </p>
      </div>
    </section>
  );
}
