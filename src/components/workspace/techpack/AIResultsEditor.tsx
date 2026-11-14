"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Edit3, Check, Wand2, RefreshCw } from "lucide-react";
import type { AIGeneratedTechPack, AIMeasurement, AIBOMItem } from "@/lib/ai/types";

interface AIResultsEditorProps {
  techPack: AIGeneratedTechPack;
  onSave: (data: Partial<AIGeneratedTechPack>) => Promise<void>;
  isGenerating: boolean;
  onRegenerate: () => Promise<void>;
}

interface MeasurementRowProps {
  item: AIMeasurement;
  index: number;
  onUpdate: (index: number, value: Partial<AIMeasurement>) => void;
  onDelete: (index: number) => void;
}

interface BOMRowProps {
  item: AIBOMItem;
  index: number;
  onUpdate: (index: number, value: Partial<AIBOMItem>) => void;
  onDelete: (index: number) => void;
}

interface MeasurementInputProps {
  value: string;
  label: string;
  onChange: (value: string) => void;
}

interface BOMInputProps {
  value: string;
  label: string;
  onChange: (value: string) => void;
}

const MEASUREMENT_POINTS = [
  "Chest / Bust", "Waist", "Hips", "Shoulder Width", "Sleeve Length",
  "Body Length", "Neck Opening", "Armhole", "Cuff", "Hem Width",
];

const BOM_CATEGORIES = [
  "Fabric", "Thread", "Buttons", "Zippers", "Labels", "Trims", "Lining", "Interfacing",
];

export function AIResultsEditor({
  techPack,
  onSave,
  isGenerating,
  onRegenerate,
}: AIResultsEditorProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingData, setEditingData] = React.useState<AIGeneratedTechPack>(techPack);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editingData);
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setIsEditing(false);
    await onRegenerate();
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              AI-Generated Tech Pack
            </h2>
            <p className="text-sm text-text-muted">
              Review and edit AI-generated specifications before saving.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" /> Edit Details
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="text-text-muted"
                >
                  Cancel
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving…" : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Confidence indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-text-secondary">
            AI Confidence Score
          </span>
          <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
            <div
              className={`h-full ${
                techPack.confidence_score != null &&
                techPack.confidence_score >= 80
                  ? "bg-brand"
                  : techPack.confidence_score != null &&
                    techPack.confidence_score >= 60
                      ? "bg-accent"
                      : "bg-surface-muted"
              }`}
              style={{ width: `${techPack.confidence_score ?? 0}%` }}
            ></div>
          </div>
          <span className="text-xs text-text-muted">
            {techPack.confidence_score ?? 0}%
          </span>
        </div>
      </div>

      {/* Sections */}
      <section className="space-y-6">
        {/* Garment Overview */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" /> Garment Overview
            </CardTitle>
            <p className="text-xs text-text-muted">
              AI-generated garment classification and description
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-text-secondary">
                  Garment Type
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {editingData.garment_overview.garment_type}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-text-secondary">
                  Category
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {editingData.garment_overview.garment_category}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-text-secondary">
                  Gender Category
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {editingData.garment_overview.gender_category || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-medium text-text-secondary">
                Description
              </span>
              <p className="text-sm text-text-muted">
                {editingData.garment_overview.description}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-medium text-text-secondary">
                Style Characteristics
              </span>
              <div className="flex flex-wrap gap-2">
                {editingData.garment_overview.style_characteristics.map(
                  (char, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded bg-surface border border-border text-text-secondary"
                    >
                      {char}
                    </span>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Details */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" /> Visual Details
            </CardTitle>
            <p className="text-xs text-text-muted">
              Construction details identified from reference image
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "Collar", value: editingData.visual_details.collar },
                { label: "Sleeves", value: editingData.visual_details.sleeves },
                { label: "Neckline", value: editingData.visual_details.neckline },
                { label: "Pockets", value: editingData.visual_details.pockets },
                { label: "Closures", value: editingData.visual_details.closures },
                { label: "Seams", value: editingData.visual_details.seams },
                { label: "Hem", value: editingData.visual_details.hem },
                {
                  label: "View Details",
                  value:
                    editingData.visual_details.visible_design_details?.join(
                      ", "
                    ) || "—",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-border bg-surface p-3"
                >
                  <span className="text-[10px] font-medium text-text-secondary">
                    {label}
                  </span>
                  <p className="text-sm text-text-primary mt-1">
                    {value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Materials */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Materials
            </CardTitle>
            <p className="text-xs text-text-muted">
              Suggested fabrics, trims, and accessories
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-medium text-text-secondary">
                  Suggested Fabric
                </span>
                <p className="text-sm font-medium text-text-primary">
                  {editingData.materials.suggested_fabric || "—"}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-text-secondary">
                  Fabric Composition
                </span>
                <p className="text-sm font-medium text-text-primary">
                  {editingData.materials.suggested_composition || "—"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-medium text-text-secondary">
                Suggested Trims
              </span>
              <div className="flex flex-wrap gap-2">
                {editingData.materials.suggested_trims?.map((trim, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded bg-surface border border-border text-text-secondary"
                  >
                    {trim}
                  </span>
                ))}
                {editingData.materials.suggested_trims?.length === 0 && (
                  <span className="text-xs text-text-muted">—</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-medium text-text-secondary">
                Suggested Accessories
              </span>
              <div className="flex flex-wrap gap-2">
                {editingData.materials.suggested_accessories?.map(
                  (accessory, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded bg-surface border border-border text-text-secondary"
                    >
                      {accessory}
                    </span>
                  )
                )}
                {editingData.materials.suggested_accessories?.length === 0 && (
                  <span className="text-xs text-text-muted">—</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Measurements */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-4 w-4" /> Measurements
            </CardTitle>
            <p className="text-xs text-text-muted">
              AI-estimated measurements from garment reference
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingData.measurements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <span className="text-sm text-text-muted">
                  No measurements detected from image
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {editingData.measurements.map((m, i) => (
                  <MeasurementRow
                    key={i}
                    item={m}
                    index={i}
                    onUpdate={(index, updates) => {
                      setEditingData((prev) => ({
                        ...prev,
                        measurements: prev.measurements.map((m, idx) =>
                          idx === index ? { ...m, ...updates } : m
                        ),
                      }));
                    }}
                    onDelete={(index) => {
                      setEditingData((prev) => ({
                        ...prev,
                        measurements: prev.measurements.filter(
                          (_, idx) => idx !== index
                        ),
                      }));
                    }}
                  />
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingData((prev) => ({
                    ...prev,
                    measurements: [
                      ...prev.measurements,
                      {
                        measurement_point: "",
                        suggested_value: "",
                        unit: "cm",
                        confidence: 0,
                        estimated_or_user_confirmed: "estimated",
                      },
                    ],
                  }));
                }}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Measurement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bill of Materials */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-4 w-4" /> Bill of Materials
            </CardTitle>
            <p className="text-xs text-text-muted">
              Suggested materials, trims, and components
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingData.bill_of_materials.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-sm text-text-muted">
                  No BOM items detected
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {editingData.bill_of_materials.map((item, i) => (
                  <BOMRow
                    key={i}
                    item={item}
                    index={i}
                    onUpdate={(index, updates) => {
                      setEditingData((prev) => ({
                        ...prev,
                        bill_of_materials: prev.bill_of_materials.map(
                          (b, idx) =>
                            idx === index ? { ...b, ...updates } : b
                        ),
                      }));
                    }}
                    onDelete={(index) => {
                      setEditingData((prev) => ({
                        ...prev,
                        bill_of_materials: prev.bill_of_materials.filter(
                          (_, idx) => idx !== index
                        ),
                      }));
                    }}
                  />
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingData((prev) => ({
                    ...prev,
                    bill_of_materials: [
                      ...prev.bill_of_materials,
                      {
                        item: "",
                        material: "",
                        suggested_quantity: "",
                        unit: "pcs",
                        notes: "",
                      },
                    ],
                  }));
                }}
              >
                <Plus className="h-3 w-3 mr-1" /> Add BOM Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Construction Details */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-4 w-4" /> Construction Details
            </CardTitle>
            <p className="text-xs text-text-muted">
              AI-generated construction recommendations
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-medium text-text-secondary">
                Stitching Suggestions
              </span>
              <div className="flex flex-wrap gap-2">
                {editingData.construction_details.stitching_suggestions?.map(
                  (s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded bg-surface border border-border text-text-secondary"
                    >
                      {s}
                    </span>
                  )
                )}
                {editingData.construction_details.stitching_suggestions?.length ===
                  0 && (
                  <span className="text-xs text-text-muted">—</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-medium text-text-secondary">
                Seam Suggestions
              </span>
              <div className="flex flex-wrap gap-2">
                {editingData.construction_details.seam_suggestions?.map(
                  (s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded bg-surface border border-border text-text-secondary"
                    >
                      {s}
                    </span>
                  )
                )}
                {editingData.construction_details.seam_suggestions?.length === 0 && (
                  <span className="text-xs text-text-muted">—</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-medium text-text-secondary">
                Finishing Suggestions
              </span>
              <div className="flex flex-wrap gap-2">
                {editingData.construction_details.finishing_suggestions?.map(
                  (s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded bg-surface border border-border text-text-secondary"
                    >
                      {s}
                    </span>
                  )
                )}
                {editingData.construction_details.finishing_suggestions?.length ===
                  0 && (
                  <span className="text-xs text-text-muted">—</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MeasurementRow({
  item,
  index,
  onUpdate,
  onDelete,
}: MeasurementRowProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    measurement_point: item.measurement_point,
    suggested_value: item.suggested_value,
    unit: item.unit,
    confidence: item.confidence,
    estimated_or_user_confirmed:
      item.estimated_or_user_confirmed || "estimated",
  });

  const handleSave = () => {
    onUpdate(index, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      measurement_point: item.measurement_point,
      suggested_value: item.suggested_value,
      unit: item.unit,
      confidence: item.confidence,
      estimated_or_user_confirmed:
        item.estimated_or_user_confirmed || "estimated",
    });
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface/50">
      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs font-medium text-text-secondary w-24">
          {item.measurement_point}
        </span>
        {!isEditing ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">
              {item.suggested_value}
            </span>
            <span className="text-xs text-text-muted">{item.unit}</span>
            <span className="text-xs text-text-muted">{item.confidence}%</span>
            <span className="text-xs text-text-muted capitalize">
              {item.estimated_or_user_confirmed}
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <MeasurementInput
              value={formData.measurement_point}
              label="Measurement Point"
              onChange={(v) =>
                setFormData((d) => ({ ...d, measurement_point: v }))
              }
            />
            <MeasurementInput
              value={formData.suggested_value}
              label="Value"
              onChange={(v) =>
                setFormData((d) => ({ ...d, suggested_value: v }))
              }
            />
            <MeasurementInput
              value={formData.unit}
              label="Unit"
              onChange={(v) => setFormData((d) => ({ ...d, unit: v }))}
            />
            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs text-text-muted hover:text-brand"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
        <button
          onClick={() => onDelete(index)}
          className="text-xs text-error hover:text-error"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function MeasurementInput({
  value,
  label,
  onChange,
}: MeasurementInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-medium text-text-secondary">
        {label}
      </label>
      <input
        type="text"
        className="h-8 w-full rounded border border-input bg-background px-2 py-1 text-xs focus:ring-0 focus:border-brand disabled:bg-surface/50 disabled:text-text-muted disabled:cursor-not-allowed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function BOMRow({
  item,
  index,
  onUpdate,
  onDelete,
}: BOMRowProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    item: item.item,
    material: item.material,
    suggested_quantity: item.suggested_quantity,
    unit: item.unit,
    notes: item.notes || "",
  });

  const handleSave = () => {
    onUpdate(index, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      item: item.item,
      material: item.material,
      suggested_quantity: item.suggested_quantity,
      unit: item.unit,
      notes: item.notes || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface/50">
      <div className="flex-1">
        {!isEditing ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">
              {item.item}
            </span>
            <span className="text-[10px] text-text-muted">
              {item.material}
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <BOMInput
              value={formData.item}
              label="Item"
              onChange={(v) => setFormData((d) => ({ ...d, item: v }))}
            />
            <BOMInput
              value={formData.material}
              label="Material"
              onChange={(v) => setFormData((d) => ({ ...d, material: v }))}
            />
          </div>
        )}
      </div>
      <div className="flex-1 text-right text-sm text-text-secondary">
        {item.suggested_quantity} {item.unit}
      </div>
      <div className="flex items-end gap-2">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-text-muted hover:text-brand"
          >
            Edit
          </button>
        ) : (
          <div className="flex items-end gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>
      <button
        onClick={() => onDelete(index)}
        className="text-xs text-error hover:text-error"
      >
        Delete
      </button>
    </div>
  );
}

function BOMInput({ value, label, onChange }: BOMInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-medium text-text-secondary">
        {label}
      </label>
      <input
        type="text"
        className="h-8 w-full rounded border border-input bg-background px-2 py-1 text-xs focus:ring-0 focus:border-brand disabled:bg-surface/50 disabled:text-text-muted disabled:cursor-not-allowed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}