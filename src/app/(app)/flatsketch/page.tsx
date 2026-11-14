"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FlatSketchPreview } from "@/components/workspace/flatsketch/FlatSketchPreview";
import {
  createProject,
  createFlatSketch,
  getFlatSketches,
  uploadFile,
  getBucketForFeature,
  exportFlatSketchPDF,
} from "@/lib/services";
import { createClient } from "@/lib/supabase";

export default function FlatSketchPage() {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [sourceFile, setSourceFile] = React.useState<File | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [flatSketches, setFlatSketches] = React.useState<Array<{
    id: string;
    project_id: string;
    view: string;
    source_image_url: string | null;
    created_at: string;
  }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [exportingFS, setExportingFS] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUserId(user?.id ?? null);
      });
    }
  }, []);

  const loadFlatSketches = async () => {
    try {
      const result = await getFlatSketches();
      if (result.success) {
        setFlatSketches(
          (result.data ?? []).map((fs) => ({
            id: fs.id,
            project_id: fs.project_id,
            view: fs.view,
            source_image_url: fs.source_image_url,
            created_at: fs.created_at,
          }))
        );
      }
    } catch {
      // Silently fail
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadFlatSketches();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    setSourceFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setSourceFile(null);
    setImageUrl(null);
  };

  const handleGenerate = async () => {
    if (!sourceFile) return;

    setGenerating(true);
    setSaving(true);
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Create a project
      if (!userId) {
        setError("User not authenticated");
        return;
      }
      const projectResult = await createProject({
        user_id: userId,
        name: `Flat Sketch ${new Date().toLocaleDateString()}`,
        description: "Generated from garment photo",
        type: "flat_sketch",
        status: "generating",
      });

      if (!projectResult.success) {
        setError(projectResult.error?.message || "Failed to create project");
        return;
      }

      const project = projectResult.data!;

      // Step 2: Upload source image to storage
      const bucket = getBucketForFeature("flat_sketch");
      const uploadResult = await uploadFile(
        bucket,
        sourceFile,
        userId,
        project.id
      );

      if (!uploadResult.success) {
        setError(uploadResult.error?.message || "Failed to upload source image");
        return;
      }

      // Step 3: Create the flat sketch record with storage path
      const flatSketchResult = await createFlatSketch({
        project_id: project.id,
        source_image_url: uploadResult.data?.path || null,
        generated_sketch_url: null,
        svg_url: null,
        view: "front",
      });

      if (!flatSketchResult.success) {
        setError(
          flatSketchResult.error?.message || "Failed to create flat sketch"
        );
        return;
      }

      setSaving(false);
      setGenerating(false);
      setUploading(false);
      setSuccess("Flat sketch created successfully!");
      await loadFlatSketches();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
      setGenerating(false);
      setUploading(false);
    }
  };

  const handleExportPDF = async (id: string) => {
    setExportingFS(id);
    setError(null);
    try {
      const result = await exportFlatSketchPDF(id, projectIdFromFlatSketch(id), userId || "");
      if (!result.success) {
        setError(result.error?.message || "PDF export failed");
        return;
      }
      const blob = result.data.blob as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess("PDF exported successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExportingFS(null);
    }
  };

  const projectIdFromFlatSketch = (fsId: string): string => {
    const fs = flatSketches.find((f) => f.id === fsId);
    return fs ? fs.project_id : fsId;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Error / Success messages */}
      {error && (
        <div className="rounded-md bg-error/10 p-4 border border-error/20 mb-4">
          <p className="text-sm text-error">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-success/10 p-4 border border-success/20 mb-4">
          <p className="text-sm text-success">{success}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSuccess(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-text-inverse text-sm font-bold">
            01
          </span>
          <h1 className="text-lg font-semibold text-text-primary">
            Flat Sketch Generator
          </h1>
        </div>
        <p className="text-sm text-text-muted">
          Choose a photo, generate your sketch, then review and download.
        </p>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FlatSketchPreview
              imageUrl={imageUrl}
              onDownloadPng={() => {}}
              onDownloadSvg={() => {}}
            />
          </div>
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-text-primary">
                Upload your garment
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Front photo required · Back photo optional
              </p>
              <div className="mt-6 space-y-4">
                <div
                  className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface p-6 text-center hover:border-brand transition-colors"
                  onClick={() => {}}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand mb-2">
                    📷
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    Upload front photo
                  </span>
                  <span className="text-xs text-text-muted block mt-1">
                    JPG, PNG, WEBP · Max 5MB
                  </span>
                </div>
                <button
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-center text-sm text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  <span className="h-4 w-4 rounded-full border border-brand text-brand flex items-center justify-center">
                    +
                  </span>
                  <span>Add back photo</span>
                </button>
              </div>
              {sourceFile && imageUrl && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <span className="text-xs text-text-muted truncate max-w-[200px]">
                    {sourceFile.name}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              )}
              <Button
                className="w-full"
                disabled={!sourceFile || generating || saving || uploading}
                onClick={handleGenerate}
              >
                {generating || saving || uploading
                  ? "Generating…"
                  : "Generate flat sketch"}
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-text-primary">Samples</h2>
              <p className="mt-1 text-sm text-text-muted">
                Try a sample garment before uploading your own.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {[
                  { name: "Essentials Hoodie", type: "Front view of hoodie" },
                  { name: "Aritzia Dress", type: "Front view of dress" },
                ].map((sample, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-surface transition-colors"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                      <span className="text-sm">👕</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {sample.name}
                      </div>
                      <div className="text-xs text-text-muted">{sample.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved flat sketches */}
      {!loading && flatSketches.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Saved flat sketches</h2>
          <div className="space-y-3">
            {flatSketches.map((fs) => (
              <div key={fs.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface/50">
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">
                    Flat Sketch #{fs.id.slice(0, 8)}
                  </div>
                  <div className="text-xs text-text-muted">
                    View: {fs.view.charAt(0).toUpperCase() + fs.view.slice(1)}
                  </div>
                  {fs.source_image_url && (
                    <div className="text-[10px] text-text-muted">
                      Source image uploaded
                    </div>
                  )}
                </div>
                <div className="text-xs text-text-muted">
                  {new Date(fs.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  {exportingFS === fs.id ? (
                    <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent"></span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleExportPDF(fs.id)}
                    >
                      <span className="h-4 w-4">📄</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
