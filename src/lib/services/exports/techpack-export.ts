/**
 * FashionTech AI - Tech Pack Export Service
 *
 * Generates PDF and Excel exports for tech pack records.
 * Retrieves private images via signed URLs and handles missing data gracefully.
 */

import { createPDFDocument, type ImageInfo } from "@/lib/services/exports/pdf";
import {
  createExcelWorkbook,
  createHeaderRow,
  createDataRow,
  setColumnWidths,
  addTitleRow,
} from "@/lib/services/exports/excel";
import { getSignedFileUrl } from "@/lib/services/storage";
import { createClient } from "@/lib/supabase";
import type { TechPack } from "@/types/database";

type SupabaseClient = ReturnType<typeof createClient>;

async function getClient(): Promise<SupabaseClient | null> {
  return createClient();
}

function errorResult(message: string, code?: string, details?: unknown) {
  return {
    data: null,
    error: { message, code, details },
    success: false,
  } as const;
}

function successResult<T>(data: T) {
  return { data, error: null, success: true } as const;
}

/**
 * Converts a JSON value to a display string for export.
 */
function jsonToDisplayString(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "—";
  }
}

/**
 * Formats measurements JSON into a readable table-friendly string.
 */
function formatMeasurements(measurements: unknown): string {
  if (!measurements || typeof measurements !== "object") return "—";
  try {
    const m = measurements as Record<string, unknown>;
    const entries = Object.entries(m);
    if (entries.length === 0) return "—";
    return entries
      .map(([key, val]) => `${key}: ${jsonToDisplayString(val)}`)
      .join("; ");
  } catch {
    return "—";
  }
}

/**
 * Formats BOM JSON into a readable table-friendly string.
 */
function formatBOM(bom: unknown): string {
  if (!bom || typeof bom !== "object") return "—";
  try {
    const b = bom as Record<string, unknown>;
    const entries = Object.entries(b);
    if (entries.length === 0) return "—";
    return entries
      .map(([key, val]) => `${key}: ${jsonToDisplayString(val)}`)
      .join("; ");
  } catch {
    return "—";
  }
}

/**
 * Exports a tech pack to PDF.
 * Retrieves the tech pack record, its project, profile, and any reference image
 * via signed URL, then generates a professional PDF document.
 */
export async function exportTechPackPDF(
  techPackId: string,
  projectId: string,
  userId: string
) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  // Fetch tech pack (RLS ensures user owns it via project)
  const { data: techPack, error: tpError } = await supabase
    .from("tech_packs")
    .select("*")
    .eq("id", techPackId)
    .eq("project_id", projectId)
    .single();

  if (tpError || !techPack) {
    return errorResult(tpError?.message || "Tech pack not found", "not_found");
  }

  // Fetch project
  const { data: project, error: pError } = await supabase
    .from("projects")
    .select("name, status")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (pError || !project) {
    return errorResult(pError?.message || "Project not found", "not_found");
  }

  // Fetch profile for brand info
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, brand_name, brand_contact")
    .eq("id", userId)
    .single();

  // Get signed URL for reference image if present
  let referenceImageInfo: ImageInfo | null = null;
  if (techPack.reference_image_url) {
    const urlResult = await getSignedFileUrl(
      "garment-references",
      techPack.reference_image_url,
      300
    );
    if (urlResult.success && urlResult.data?.url) {
      referenceImageInfo = {
        url: urlResult.data.url,
        width: 400,
        height: 400,
        alt: "Reference image",
      };
    }
  }

  const brandName = profile?.brand_name || profile?.full_name || "FashionTech AI";
  const garmentName = techPack.garment_type || "Untitled Garment";
  const docTitle = `Tech Pack - ${garmentName}`;
  const docSubtitle = `Project: ${project.name}`;

  const pdf = createPDFDocument({
    title: docTitle,
    subtitle: docSubtitle,
    brandName,
  });

  pdf.addHeader();

  let y = pdf.margin * 0.8 + 18;

  // Section: Document Header Info
  y = pdf.addSectionHeading("Tech Pack Details", y);
  y = pdf.addFieldRow("Project", project.name, y);
  y = pdf.addFieldRow("Garment Type", techPack.garment_type || "Not specified", y);
  y = pdf.addFieldRow("Size Range", techPack.size_range || "Not specified", y);
  y = pdf.addFieldRow("Status", project?.status || "draft", y);
  y = pdf.addDivider(y);

  // Section: Reference Image
  y = pdf.addSectionHeading("Reference Image", y);
  if (referenceImageInfo) {
    y = await pdf.addImage(referenceImageInfo, y, 50);
  } else {
    y = pdf.addBodyText(
      "No reference image uploaded.",
      y,
      9,
      5
    );
    y += 4;
  }

  // Section: Construction Notes
  y = pdf.addSectionHeading("Construction Notes", y);
  y = pdf.addBodyText(
    techPack.construction_notes || "No construction notes provided.",
    y
  );

  // Section: Measurements
  y = pdf.addSectionHeading("Measurements", y);
  y = pdf.addBodyText(
    formatMeasurements(techPack.measurements),
    y
  );

  // Section: Bill of Materials
  y = pdf.addSectionHeading("Bill of Materials (BOM)", y);
  y = pdf.addBodyText(
    formatBOM(techPack.bom),
    y
  );

  // Footer info
  pdf.addDivider(y);
  pdf.addBodyText(
    `Generated on ${new Date().toLocaleDateString()} by ${brandName}`,
    y,
    8,
    4
  );

  const blob = pdf.finalize();
  const fileName = `tech-pack-${techPack.id.slice(0, 8)}-${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;

  return successResult({ blob, fileName, type: "application/pdf" });
}

/**
 * Exports a tech pack to Excel workbook.
 * Creates separate sheets for Overview, Specifications, Measurements, BOM, and Construction.
 */
export async function exportTechPackExcel(
  techPackId: string,
  projectId: string,
  userId: string
) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  const { data: techPack, error: tpError } = await supabase
    .from("tech_packs")
    .select("*")
    .eq("id", techPackId)
    .eq("project_id", projectId)
    .single();

  if (tpError || !techPack) {
    return errorResult(tpError?.message || "Tech pack not found", "not_found");
  }

  const { data: project, error: pError } = await supabase
    .from("projects")
    .select("name, status")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (pError || !project) {
    return errorResult(pError?.message || "Project not found", "not_found");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("brand_name, full_name")
    .eq("id", userId)
    .single();

  const { workbook, companyName } = createExcelWorkbook({
    title: `Tech Pack - ${techPack.garment_type || "Untitled"}`,
    companyName: profile?.brand_name || profile?.full_name || "FashionTech AI",
  });

  // Overview sheet
  const overviewSheet = workbook.addWorksheet("Overview");
  addTitleRow(overviewSheet, `Tech Pack Overview - ${techPack.garment_type || "Untitled Garment"}`, 1, companyName);
  createHeaderRow(overviewSheet, ["Field", "Value"], 5);
  createDataRow(overviewSheet, ["Project", project.name], 6);
  createDataRow(overviewSheet, ["Garment Type", techPack.garment_type || "Not specified"], 7);
  createDataRow(overviewSheet, ["Size Range", techPack.size_range || "Not specified"], 8);
  createDataRow(overviewSheet, ["Status", project?.status || "draft"], 9);
  createDataRow(
    overviewSheet,
    ["Reference Image", techPack.reference_image_url || "Not uploaded"],
    10
  );
  createDataRow(
    overviewSheet,
    ["Construction Notes", techPack.construction_notes || "Not provided"],
    11
  );
  setColumnWidths(overviewSheet, ["Field", "Value"]);

  // Specifications sheet
  const specsSheet = workbook.addWorksheet("Specifications");
  addTitleRow(specsSheet, "Specifications", 1, companyName);
  createHeaderRow(specsSheet, ["Field", "Value"], 3);
  createDataRow(specsSheet, ["Garment Type", techPack.garment_type || "—"], 4);
  createDataRow(specsSheet, ["Size Range", techPack.size_range || "—"], 5);
  createDataRow(specsSheet, ["Flat Sketch URL", techPack.flat_sketch_url || "—"], 6);
  setColumnWidths(specsSheet, ["Field", "Value"]);

  // Measurements sheet
  const measurementsSheet = workbook.addWorksheet("Measurements");
  addTitleRow(measurementsSheet, "Measurements", 1, companyName);
  createHeaderRow(measurementsSheet, ["Measurement", "Value"], 3);
  if (techPack.measurements && typeof techPack.measurements === "object") {
    const m = techPack.measurements as Record<string, unknown>;
    let row = 4;
    Object.entries(m).forEach(([key, val]) => {
      createDataRow(measurementsSheet, [key, jsonToDisplayString(val)], row);
      row++;
    });
  } else {
    createDataRow(measurementsSheet, ["No measurements recorded", "—"], 4);
  }
  setColumnWidths(measurementsSheet, ["Measurement", "Value"]);

  // BOM sheet
  const bomSheet = workbook.addWorksheet("Bill of Materials");
  addTitleRow(bomSheet, "Bill of Materials", 1, companyName);
  createHeaderRow(bomSheet, ["Item", "Specification"], 3);
  if (techPack.bom && typeof techPack.bom === "object") {
    const b = techPack.bom as Record<string, unknown>;
    let row = 4;
    Object.entries(b).forEach(([key, val]) => {
      createDataRow(bomSheet, [key, jsonToDisplayString(val)], row);
      row++;
    });
  } else {
    createDataRow(bomSheet, ["No BOM items recorded", "—"], 4);
  }
  setColumnWidths(bomSheet, ["Item", "Specification"]);

  // Construction sheet
  const constructionSheet = workbook.addWorksheet("Construction Details");
  addTitleRow(constructionSheet, "Construction Details", 1, companyName);
  createHeaderRow(constructionSheet, ["Field", "Value"], 3);
  createDataRow(
    constructionSheet,
    ["Construction Notes", techPack.construction_notes || "Not provided"],
    4
  );
  setColumnWidths(constructionSheet, ["Field", "Value"]);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

  const fileName = `tech-pack-${techPack.id.slice(0, 8)}-${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;

  return successResult({ blob, fileName, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export type { TechPack };
