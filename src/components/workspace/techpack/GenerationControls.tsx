"use client";

import * as React from "react";
import { RadioGroup, RadioGroupItem, RadioGroupIndicator } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";


interface GenerationControlsProps {
  effort: "low" | "max";
  setEffort: (effort: "low" | "max") => void;
  designNotes: string;
  setDesignNotes: (notes: string) => void;
  generating: boolean;
  onGenerate: () => void;
  disabled: boolean;
}

export function GenerationControls({
  effort,
  setEffort,
  designNotes,
  setDesignNotes,
  generating,
  onGenerate,
  disabled,
}: GenerationControlsProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Tech pack setup
        </h2>
        <p className="text-sm text-text-muted">
          Set your sizes and add any details the image cannot show.
        </p>

        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm text-text-secondary">Generation effort</span>
          <RadioGroup
            value={effort}
            onValueChange={setEffort as (value: string) => void}
            className="grid grid-cols-2 gap-3"
          >
            <RadioGroupItem value="low" className="flex items-center gap-2 py-2 px-3 rounded-lg border border-border bg-background hover:bg-surface">
              <RadioGroupIndicator />
              <div>
                <div className="text-sm font-medium text-text-primary">Low</div>
                <div className="text-[10px] text-text-muted">
                  2–3 min · Faster results
                </div>
              </div>
            </RadioGroupItem>
            <RadioGroupItem value="max" className="flex items-center gap-2 py-2 px-3 rounded-lg border border-border bg-background hover:bg-surface">
              <RadioGroupIndicator />
              <div>
                <div className="text-sm font-medium text-text-primary">Max</div>
                <div className="text-[10px] text-text-muted">
                  8–10 min · Highest quality
                </div>
              </div>
            </RadioGroupItem>
          </RadioGroup>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Design notes
          </label>
          <textarea
            value={designNotes}
            onChange={(e) => setDesignNotes(e.target.value)}
            placeholder="Describe the garment, construction, materials, trims, artwork placement, measurements..."
            className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          />
          <p className="mt-1 text-[10px] text-text-muted">
            Optional · specs, measurements, or a style block
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
            <span className="text-brand font-medium">✓</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Techpack defaults
            </h3>
            <p className="text-xs text-text-muted">
              XS to XL · 5 sizes · sample M · CM
            </p>
          </div>
        </div>
        <div className="flex items-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            disabled={disabled}
          >
            Edit saved defaults
          </Button>
          <Button
            onClick={onGenerate}
            disabled={disabled || generating}
            className="px-6"
          >
            {generating ? "Generating…" : "Generate tech pack"}
          </Button>
        </div>
      </div>

      {disabled && (
        <p className="text-sm text-text-muted">
          Add a front view to generate. The back view is optional.
        </p>
      )}
    </section>
  );
}
