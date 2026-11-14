"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Image as ImageIcon2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailCallout {
  id: number;
  label: string;
  active: boolean;
}

const DETAILS: DetailCallout[] = [
  { id: 1, label: "Waistband & fly", active: true },
  { id: 2, label: "Knee seam", active: false },
  { id: 3, label: "Hem stitching", active: false },
];

interface FlatSketchPreviewProps {
  imageUrl: string | null;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
}

export function FlatSketchPreview({
  imageUrl,
  onDownloadPng,
  onDownloadSvg,
}: FlatSketchPreviewProps) {
  const [activeDetail, setActiveDetail] = React.useState(1);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-text-primary">
          From garment photo to editable flat sketch
        </h2>
        <p className="text-sm text-text-muted">
          Compare the photo with the generated flat, then inspect the SVG stitch details.
        </p>
        <div className="mt-4 flex w-full items-center justify-between text-[10px] font-mono text-text-muted uppercase tracking-wider">
          <span>Photo &rarr; flat sketch &rarr; SVG</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
            <span className="text-xs font-medium text-text-secondary">Source photo</span>
            <div className="flex-1 rounded-lg border border-border bg-card overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt="Source garment photo" className="w-full h-48 object-cover" />
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-text-muted" />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <span className="text-xs font-medium text-text-secondary">Generated flat</span>
            <div className="flex-1 rounded-lg border border-border bg-surface overflow-hidden">
              {imageUrl ? (
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-brand">
                  <ImageIcon2 className="h-12 w-12 text-brand" />
                  <span className="mt-2 text-xs text-text-muted">Generated preview</span>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-text-muted" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {DETAILS.map((detail) => (
            <button
              key={detail.id}
              onClick={() => setActiveDetail(detail.id)}
              className={cn(
                "flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-colors",
                detail.active
                  ? "border-brand bg-brand text-text-inverse"
                  : "border-border text-text-secondary hover:bg-surface"
              )}
            >
              {detail.id}. {detail.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted">
          Generated PNG · Select a numbered detail to inspect the SVG.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-text-primary">Stitch details</h3>
        <p className="text-sm text-text-muted">SVG close-up</p>
        <div className="mt-4 rounded-lg border border-border bg-surface p-4 text-center">
          <ImageIcon className="h-24 w-24 text-text-muted" />
          <p className="mt-2 text-xs text-text-muted">
            SVG close-up: {DETAILS.find((d) => d.id === activeDetail)?.label}
          </p>
        </div>
        <p className="text-xs text-text-muted">
          Review the {DETAILS.find((d) => d.id === activeDetail)?.label.toLowerCase()} against the source photo.
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs font-medium text-text-primary">
          <span>Download sample SVG</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDownloadPng}>
            Download PNG
          </Button>
          <Button size="sm" onClick={onDownloadSvg}>
            Download SVG
          </Button>
        </div>
      </div>
    </section>
  );
}
