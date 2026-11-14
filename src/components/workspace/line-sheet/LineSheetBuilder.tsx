"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Shirt, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const SAMPLE_SKETCHES = [
  { id: "hd-001", name: "Everyday hoodie", code: "HD-001" },
  { id: "pt-002", name: "Panel trousers", code: "PT-002" },
] as const;

interface LineSheetBuilderProps {
  onDownloadPdf: () => void;
  disabled?: boolean;
}

export function LineSheetBuilder({
  onDownloadPdf,
  disabled = false,
}: LineSheetBuilderProps) {
  const [selectedSketches, setSelectedSketches] = React.useState<string[]>([]);

  const toggleSketch = (id: string) => {
    setSelectedSketches((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-text-primary">
          AI Line Sheets from your flat sketches
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Use AI to render your sketches in different colors and fabrics. Choose the versions you like, add your style details, and download a PDF for your next collection review.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <Button className="w-full" variant="outline" asChild disabled={disabled}>
            <a href="#">Create a line sheet</a>
          </Button>
          <p className="text-xs text-text-muted text-center">
            Sign in for 3 free preview images per workspace.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-text-primary">
          How to create an AI line sheet
        </h2>
        <ol className="space-y-4">
          {[
            {
              num: "01",
              title: "Choose your sketches",
              desc: "Add saved flat sketches from your library.",
            },
            {
              num: "02",
              title: "Try colors and fabrics",
              desc: "Enter a color and material, or add a fabric reference.",
            },
            {
              num: "03",
              title: "Select your images",
              desc: "Choose versions to keep. Add style codes, sizes, notes.",
            },
            {
              num: "04",
              title: "Download your PDF",
              desc: "Check the preview, then download the line sheet.",
            },
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand text-text-inverse text-xs font-bold">
                {step.num}
              </span>
              <div>
                <div className="text-sm font-semibold text-text-primary">
                  {step.title}
                </div>
                <div className="text-xs text-text-muted">{step.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-text-primary">
          Saved flat sketches
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          {SAMPLE_SKETCHES.length} sample styles
        </p>
        <div className="mt-4 flex gap-4">
          {SAMPLE_SKETCHES.map((sketch) => {
            const isSelected = selectedSketches.includes(sketch.id);
            return (
              <button
                key={sketch.id}
                onClick={() => toggleSketch(sketch.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors",
                  isSelected
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-text-secondary hover:bg-surface"
                )}
              >
                <ImageIcon className="h-8 w-8" />
                <span className="text-xs font-medium">{sketch.code}</span>
                <span className="text-[10px] text-text-muted">{sketch.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-xs text-text-muted">
          Try 3 preview images free per workspace. Upgrade for watermark-free PDF exports.
        </p>
        <Button onClick={onDownloadPdf} disabled={selectedSketches.length === 0}>
          Download PDF
        </Button>
      </div>
    </section>
  );
}
