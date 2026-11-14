"use client";

import * as React from "react";
import { Upload, Image as ImageIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function FileUpload({
  onFilesChange,
  accept = "image/*",
  maxSizeMB = 5,
  disabled = false,
  multiple = false,
  className,
  children,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesChange?.(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      onFilesChange?.(files);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface/50 p-8 text-center transition-colors hover:border-brand/50 hover:bg-surface focus-within:border-brand focus-within:ring-1 focus-within:ring-brand",
        isDragActive && "border-brand bg-brand/5",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragActive(false);
      }}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10">
          <Upload className="h-6 w-6 text-brand" />
        </div>
        <p className="text-sm font-medium text-text-primary">
          {children || "Drop your design file here"}
        </p>
        <p className="text-xs text-text-muted">
          {accept === "image/*"
            ? "JPG, PNG, WEBP · Max 5MB"
            : "PDF, AI, EPS, PNG, JPEG · Max 100MB"}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const input = containerRef.current?.querySelector("input");
          if (input) (input as HTMLInputElement).click();
        }}
        disabled={disabled}
      >
        Browse files
      </Button>
    </div>
  );
}

export { ACCEPTED_IMAGE_TYPES };
