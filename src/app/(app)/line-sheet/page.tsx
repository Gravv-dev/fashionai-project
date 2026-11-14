"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LineSheetBuilder } from "@/components/workspace/line-sheet/LineSheetBuilder";
import {
  createProject,
  createLineSheet,
  getLineSheets,
  uploadFile,
  getBucketForFeature,
  exportLineSheetPDF,
} from "@/lib/services";
import { createClient } from "@/lib/supabase";

export default function LineSheetPage() {
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [lineSheets, setLineSheets] = React.useState<Array<{
    id: string;
    project_id: string;
    collection_title: string | null;
    product_image_url: string | null;
    created_at: string;
  }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [productImage, setProductImage] = React.useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = React.useState<string | null>(
    null
  );
  const [exportingLS, setExportingLS] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUserId(user?.id ?? null);
      });
    }
  }, []);

  const loadLineSheets = async () => {
    try {
      const result = await getLineSheets();
      if (result.success) {
        setLineSheets(
          (result.data ?? []).map((ls) => ({
            id: ls.id,
            project_id: ls.project_id,
            collection_title: ls.collection_title,
            product_image_url: ls.product_image_url,
            created_at: ls.created_at,
          }))
        );
      }
    } catch {
      // Silently fail
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadLineSheets();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleImageFiles = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setProductImage(file);
      setProductImagePreview(URL.createObjectURL(file));
    }
  };

  const removeProductImage = () => {
    setProductImage(null);
    setProductImagePreview(null);
  };

  const handleCreateLineSheet = async () => {
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
        name: `Line Sheet ${new Date().toLocaleDateString()}`,
        description: "Collection review sheet",
        type: "line_sheet",
        status: "draft",
      });

      if (!projectResult.success) {
        setError(projectResult.error?.message || "Failed to create project");
        return;
      }

      const project = projectResult.data!;

      // Step 2: Upload product image to storage (if provided)
      let productImageUrl: string | null = null;
      if (productImage) {
        const bucket = getBucketForFeature("line_sheet");
        const uploadResult = await uploadFile(
          bucket,
          productImage,
          userId,
          project.id
        );

        if (!uploadResult.success) {
          setError(
            uploadResult.error?.message || "Failed to upload product image"
          );
          return;
        }
        productImageUrl = uploadResult.data?.path || null;
      }

      // Step 3: Create the line sheet record
      const lineSheetResult = await createLineSheet({
        project_id: project.id,
        collection_title: null,
        season: null,
        styles: null,
        pdf_url: null,
        product_image_url: productImageUrl,
      });

      if (!lineSheetResult.success) {
        setError(
          lineSheetResult.error?.message || "Failed to create line sheet"
        );
        return;
      }

      setSaving(false);
      setGenerating(false);
      setUploading(false);
      setSuccess("Line sheet created successfully!");
      await loadLineSheets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
      setGenerating(false);
      setUploading(false);
    }
  };

  const handleExportPDF = async (id: string) => {
    setExportingLS(id);
    setError(null);
    try {
      const result = await exportLineSheetPDF([id], projectIdFromLineSheet(id), userId || "");
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
      setExportingLS(null);
    }
  };

  const projectIdFromLineSheet = (lsId: string): string => {
    const ls = lineSheets.find((l) => l.id === lsId);
    return ls ? ls.project_id : lsId;
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
            Line Sheet Studio
          </h1>
        </div>
        <p className="text-sm text-text-muted">
          AI line sheets from your flat sketches. Create collection reviews for your team and buyers.
        </p>

        <LineSheetBuilder
          onDownloadPdf={handleCreateLineSheet}
          disabled={generating || saving || uploading}
        />

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Product image (optional)</h2>
          <p className="mt-1 text-sm text-text-muted">
            Upload a product image to include in your line sheet.
          </p>
          <div className="mt-4 space-y-4">
            <div
              className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface p-6 text-center hover:border-brand transition-colors"
              onClick={() => {}}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand mb-2">
                📷
              </span>
              <span className="text-sm font-medium text-text-primary">
                Upload product image
              </span>
              <span className="text-xs text-text-muted block mt-1">
                JPG, PNG, WEBP · Max 5MB
              </span>
            </div>
            {productImage && productImagePreview && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                <img
                  src={productImagePreview}
                  alt="Product image preview"
                  className="h-12 w-12 rounded-md object-cover"
                />
                <span className="text-xs text-text-muted truncate max-w-[200px]">
                  {productImage.name}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeProductImage}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Line sheet vs tech pack</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-text-primary">Line sheet</h3>
              <p className="mt-2 text-sm text-text-muted">
                Show the range with images, colorways, and style details. Use it for collection reviews or send a version with prices to buyers.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-4 w-full">
                <Link href="/line-sheet">Build a line sheet</Link>
              </Button>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-text-primary">Tech pack</h3>
              <p className="mt-2 text-sm text-text-muted">
                Specify how to make it. Document measurements, materials, and construction for one style.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-4 w-full">
                <Link href="/techpack">Generate a tech pack</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Saved line sheets */}
      {!loading && lineSheets.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Saved line sheets</h2>
          <div className="space-y-3">
            {lineSheets.map((ls) => (
              <div key={ls.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface/50">
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">
                    Line Sheet #{ls.id.slice(0, 8)}
                  </div>
                  <div className="text-xs text-text-muted">
                    {ls.collection_title || "Collection title not set"}
                  </div>
                  {ls.product_image_url && (
                    <div className="text-[10px] text-text-muted">
                      Product image uploaded
                    </div>
                  )}
                </div>
                <div className="text-xs text-text-muted">
                  {new Date(ls.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  {exportingLS === ls.id ? (
                    <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent"></span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleExportPDF(ls.id)}
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
