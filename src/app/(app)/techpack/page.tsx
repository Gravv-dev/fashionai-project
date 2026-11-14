"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ReferenceUpload } from "@/components/workspace/techpack/ReferenceUpload";
import { ProgressStep } from "@/components/shared/ProgressStep";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  createProject,
  createTechPack,
  getTechPacks,
  updateTechPack,
  uploadFile,
  getBucketForFeature,
} from "@/lib/services";
import { EmptyState } from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase";
import {
  generateTechPackFromImage,
} from "@/lib/ai/services";
import { AIResultsEditor } from "@/components/workspace/techpack/AIResultsEditor";
import { AIProgressTracker } from "@/components/workspace/techpack/AIProgressTracker";
import { Wand2, RefreshCw } from "lucide-react";
import { exportTechPackPDF as exportTechPackPDFService } from "@/lib/services/exports/techpack-export";
import { exportTechPackExcel as exportTechPackExcelService } from "@/lib/services/exports/techpack-export";
import type { TechPack, Json } from "@/types/database";
import type { AIGeneratedTechPack } from "@/lib/ai/types";
import { GenerationControls } from "@/components/workspace/techpack/GenerationControls";

export default function TechPackPage() {
  const [referenceFiles, setReferenceFiles] = React.useState<File[]>([]);
  const [referencePreview, setReferencePreview] = React.useState<string | null>(
    null
  );
  const [effort, setEffort] = React.useState<"low" | "max">("low");
  const [designNotes, setDesignNotes] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [techPacks, setTechPacks] = React.useState<Array<{
    id: string;
    project_id: string;
    garment_type: string | null;
    reference_image_url: string | null;
    created_at: string;
    ai_status: string | null;
  }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState<{ id: string; type: "pdf" | "excel" } | null>(null);
  const [currentGenerationStep, setCurrentGenerationStep] = React.useState(0);
  const [aiGeneratedPack, setAiGeneratedPack] = React.useState<TechPack | null>(null);
  const [showAiEditor, setShowAiEditor] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUserId(user?.id ?? null);
      });
    }
  }, []);

  const loadTechPacks = async () => {
    try {
      const result = await getTechPacks();
      if (result.success) {
        setTechPacks(
          (result.data ?? []).map((tp) => ({
            id: tp.id,
            project_id: tp.project_id,
            garment_type: tp.garment_type,
            reference_image_url: tp.reference_image_url,
            created_at: tp.created_at,
            ai_status: tp.ai_status,
          }))
        );
      }
    } catch {
      // Silently fail - tech packs list is secondary
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadTechPacks();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleFiles = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setReferenceFiles([file]);
      setReferencePreview(URL.createObjectURL(file));
    }
  };

  const removeReference = () => {
    setReferenceFiles([]);
    setReferencePreview(null);
  };

  const handleGenerate = async () => {
    if (referenceFiles.length === 0) return;

    setGenerating(true);
    setSaving(true);
    setUploading(true);
    setError(null);
    setSuccess(null);
    setCurrentGenerationStep(0);

    try {
      if (!userId) {
        setError("User not authenticated");
        return;
      }
      const projectResult = await createProject({
        user_id: userId,
        name: `Tech Pack ${new Date().toLocaleDateString()}`,
        description: "Generated from garment reference",
        type: "tech_pack",
        status: "generating",
      });

      if (!projectResult.success) {
        setError(projectResult.error?.message || "Failed to create project");
        return;
      }

      const project = projectResult.data!;

      setCurrentGenerationStep(1);
      const bucket = getBucketForFeature("tech_pack");
      const uploadResult = await uploadFile(
        bucket,
        referenceFiles[0],
        userId,
        project.id
      );

      if (!uploadResult.success) {
        setError(uploadResult.error?.message || "Failed to upload reference image");
        return;
      }

      setCurrentGenerationStep(2);
      const aiResult = await generateTechPackFromImage(
        uploadResult.data?.path || "",
        project.id,
        userId
      );

      if (!aiResult.success || !aiResult.data) {
        setError(aiResult.error?.message || "AI generation failed");
        return;
      }

      setCurrentGenerationStep(3);
      const techPackResult = await createTechPack({
        project_id: project.id,
        garment_type: aiResult.data.garment_type,
        size_range: null,
        measurements: aiResult.data.measurements as unknown as Json,
        bom: aiResult.data.bom as unknown as Json,
        construction_notes: aiResult.data.construction_notes,
        flat_sketch_url: null,
        reference_image_url: uploadResult.data?.path || null,
        ai_garment_type: aiResult.data.ai_garment_type,
        ai_garment_category: aiResult.data.ai_garment_category,
        ai_gender_category: aiResult.data.ai_gender_category,
        ai_description: aiResult.data.ai_description,
        ai_style_characteristics: aiResult.data.ai_style_characteristics as unknown as Json,
        ai_visual_details: aiResult.data.ai_visual_details as unknown as Json,
        ai_materials: aiResult.data.ai_materials as unknown as Json,
        ai_measurements: aiResult.data.ai_measurements as unknown as Json,
        ai_bill_of_materials: aiResult.data.ai_bill_of_materials as unknown as Json,
        ai_construction_details: aiResult.data.ai_construction_details as unknown as Json,
        ai_confidence_score: aiResult.data.ai_confidence_score,
        ai_model_used: aiResult.data.ai_model_used,
        ai_status: aiResult.data.ai_status,
        ai_generated_at: aiResult.data.ai_generated_at,
      });

      if (!techPackResult.success) {
        setError(techPackResult.error?.message || "Failed to create tech pack");
        return;
      }

      setSaving(false);
      setGenerating(false);
      setUploading(false);
      setCurrentGenerationStep(4);
      setSuccess("Tech pack generated successfully!");
      setAiGeneratedPack(techPackResult.data);
      setShowAiEditor(true);
      await loadTechPacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
      setGenerating(false);
      setUploading(false);
    }
  };

  const handleExportPDF = async (id: string) => {
    setExporting({ id, type: "pdf" });
    setError(null);
    try {
      const result = await exportTechPackPDFService(id, projectIdFromTechPack(id), userId || "");
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
      setExporting(null);
    }
  };

  const handleExportExcel = async (id: string) => {
    setExporting({ id, type: "excel" });
    setError(null);
    try {
      const result = await exportTechPackExcelService(id, projectIdFromTechPack(id), userId || "");
      if (!result.success) {
        setError(result.error?.message || "Excel export failed");
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
      setSuccess("Excel exported successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(null);
    }
  };

  const projectIdFromTechPack = (tpId: string): string => {
    const tp = techPacks.find((t) => t.id === tpId);
    return tp ? tp.project_id : tpId;
  };

  const handleRegenerateAI = async () => {
    if (referenceFiles.length === 0 || !userId) return;

    setGenerating(true);
    setCurrentGenerationStep(1);
    setError(null);

    try {
      const projectResult = await createProject({
        user_id: userId,
        name: `Tech Pack ${new Date().toLocaleDateString()}`,
        description: "Regenerated from garment reference",
        type: "tech_pack",
        status: "generating",
      });

      if (!projectResult.success) {
        setError(projectResult.error?.message || "Failed to create project");
        return;
      }

      const project = projectResult.data!;

      const bucket = getBucketForFeature("tech_pack");
      const uploadResult = await uploadFile(
        bucket,
        referenceFiles[0],
        userId,
        project.id
      );

      if (!uploadResult.success) {
        setError(uploadResult.error?.message || "Failed to upload reference image");
        return;
      }

      const aiResult = await generateTechPackFromImage(
        uploadResult.data?.path || "",
        project.id,
        userId
      );

      if (!aiResult.success || !aiResult.data) {
        setError(aiResult.error?.message || "AI generation failed");
        return;
      }

      const techPackResult = await createTechPack({
        project_id: project.id,
        garment_type: aiResult.data.garment_type,
        size_range: null,
        measurements: aiResult.data.measurements as unknown as Json,
        bom: aiResult.data.bom as unknown as Json,
        construction_notes: aiResult.data.construction_notes,
        flat_sketch_url: null,
        reference_image_url: uploadResult.data?.path || null,
        ai_garment_type: aiResult.data.ai_garment_type,
        ai_garment_category: aiResult.data.ai_garment_category,
        ai_gender_category: aiResult.data.ai_gender_category,
        ai_description: aiResult.data.ai_description,
        ai_style_characteristics: aiResult.data.ai_style_characteristics as unknown as Json,
        ai_visual_details: aiResult.data.ai_visual_details as unknown as Json,
        ai_materials: aiResult.data.ai_materials as unknown as Json,
        ai_measurements: aiResult.data.ai_measurements as unknown as Json,
        ai_bill_of_materials: aiResult.data.ai_bill_of_materials as unknown as Json,
        ai_construction_details: aiResult.data.ai_construction_details as unknown as Json,
        ai_confidence_score: aiResult.data.ai_confidence_score,
        ai_model_used: aiResult.data.ai_model_used,
        ai_status: aiResult.data.ai_status,
        ai_generated_at: aiResult.data.ai_generated_at,
      });

      if (!techPackResult.success) {
        setError(techPackResult.error?.message || "Failed to create tech pack");
        return;
      }

      setGenerating(false);
      setCurrentGenerationStep(4);
      setSuccess("Tech pack regenerated successfully!");
      setAiGeneratedPack(techPackResult.data);
      setShowAiEditor(true);
      await loadTechPacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          <Button variant="outline" size="sm" onClick={() => setSuccess(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Left: Workspace */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-text-inverse text-sm font-bold">
                01
              </span>
              <h1 className="text-lg font-semibold text-text-primary">
                Tech Pack Generator
              </h1>
            </div>
            <p className="text-sm text-text-muted">
              Add your garment, choose your sizes, and generate an editable draft.
            </p>

            <ReferenceUpload
              onFilesChange={handleFiles}
              disabled={referenceFiles.length > 0 || uploading}
            />

            {referencePreview && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                <img
                  src={referencePreview}
                  alt="Reference preview"
                  className="h-12 w-12 rounded-md object-cover"
                />
                <span className="text-xs text-text-muted truncate max-w-[200px]">
                  {referenceFiles[0]?.name}
                </span>
                <Button variant="destructive" size="sm" onClick={removeReference} className="h-8 w-8 p-0">
                  ×
                </Button>
              </div>
            )}

            <GenerationControls
              effort={effort}
              setEffort={setEffort}
              designNotes={designNotes}
              setDesignNotes={setDesignNotes}
              generating={generating || saving || uploading}
              onGenerate={handleGenerate}
              disabled={referenceFiles.length === 0}
            />

            <hr className="border-border my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-text-inverse text-sm font-bold">
                  AI
                </span>
                <h2 className="text-lg font-semibold text-text-primary">
                  AI-Powered Generation
                </h2>
              </div>
              <p className="text-sm text-text-muted">
                Upload a garment reference image and let AI generate your tech pack specifications automatically.
              </p>

              {generating && (
                <div className="mb-4">
                  <AIProgressTracker
                    currentStep={currentGenerationStep}
                    totalSteps={4}
                    stepLabels={[
                      "Upload Image",
                      "Analyze Garment",
                      "Generate Specs",
                      "Save Tech Pack",
                    ]}
                    isComplete={!generating}
                  />
                </div>
              )}

              <Button
                variant="brand"
                className="w-full py-3"
                onClick={handleGenerate}
                disabled={referenceFiles.length === 0 || generating || saving || uploading}
              >
                {generating || saving || uploading ? (
                  <>
                    <span className="animate-pulse flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full bg-text-inverse animate-pulse"></span>
                      Generating Tech Pack…
                    </span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate AI Tech Pack
                  </>
                )}
              </Button>
            </div>

            {showAiEditor && aiGeneratedPack && (
              <div className="mt-6">
                <AIResultsEditor
                  techPack={aiGeneratedPack as unknown as AIGeneratedTechPack}
                  onSave={async (data) => {
                    setSaving(true);
                    try {
                      const updateResult = await updateTechPack(aiGeneratedPack!.id, {
                        garment_type: data.garment_overview?.garment_type,
                        measurements: data.measurements as unknown as Json,
                        bom: data.bill_of_materials as unknown as Json,
                        construction_notes: data.construction_details?.stitching_suggestions?.join(". ") ||
                          data.construction_details?.finishing_suggestions?.join(". ") ||
                          null,
                      });
                      if (updateResult.success) {
                        setSuccess("Tech pack updated successfully!");
                        setAiGeneratedPack(updateResult.data);
                        await loadTechPacks();
                      } else {
                        setError(updateResult.error?.message || "Failed to save changes");
                      }
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Failed to save changes");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  isGenerating={generating}
                  onRegenerate={handleRegenerateAI}
                />
              </div>
            )}
          </div>

          <div className="w-full lg:w-96 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-text-primary">Preview</h2>
              <p className="mt-1 text-sm text-text-muted">Your tech pack draft will appear here after generation.</p>
              <div className="mt-6 h-64 rounded-lg border-2 border-dashed border-border bg-surface flex items-center justify-center">
                <span className="text-text-muted">No preview yet</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-text-primary">Output includes</h2>
              <ul className="mt-4 space-y-3">
                {[
                  "Front and back flat sketches",
                  "Measurement table with size grading",
                  "Bill of materials (BOM)",
                  "Construction notes",
                  "Production details",
                  "Editable SVG export",
                  "AI-generated specifications",
                  "AI-powered design analysis",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0 h-4 w-4 rounded-full bg-success text-text-inverse text-[10px] flex items-center justify-center">
                      ✓
                    </span>
                    <span className="text-sm text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Saved tech packs */}
      {!loading && techPacks.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Saved tech packs</h2>
          </div>
          <div className="space-y-3">
            {techPacks.map((tp) => (
              <div key={tp.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface/50">
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">
                    Tech Pack #{tp.id.slice(0, 8)}
                  </div>
                  <div className="text-xs text-text-muted">
                    {tp.garment_type || "Garment type not specified"}
                  </div>
                  {tp.reference_image_url && (
                    <div className="text-[10px] text-text-muted">Reference image uploaded</div>
                  )}
                  {tp.ai_status && tp.ai_status !== "draft" && (
                    <div className="text-[10px] text-brand">AI Generated</div>
                  )}
                </div>
                <div className="text-xs text-text-muted">{new Date(tp.created_at).toLocaleDateString()}</div>
                <div className="flex items-center gap-1">
                  {exporting?.id === tp.id && exporting?.type === "pdf" ? (
                    <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent"></span>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleExportPDF(tp.id)}>
                      <span className="h-4 w-4">📄</span>
                    </Button>
                  )}
                  {exporting?.id === tp.id && exporting?.type === "excel" ? (
                    <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent"></span>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleExportExcel(tp.id)}>
                      <span className="h-4 w-4">📊</span>
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