/**
 * FashionTech AI - Line Sheet Export Service
 *
 * Generates PDF exports for line sheet records.
 * Retrieves private images via signed URLs and handles missing data gracefully.
 * Supports multiple products in a single PDF with page breaks.
 */

import { createPDFDocument, type ImageInfo } from "@/lib/services/exports/pdf";
import { getSignedFileUrl } from "@/lib/services/storage";
import { createClient } from "@/lib/supabase";
import type { LineSheet } from "@/types/database";

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
 * Formats styles JSON into a readable table-friendly string.
 */
function formatStyles(styles: unknown): string {
  if (!styles || typeof styles !== "object") return "—";
  try {
    const s = styles as Record<string, unknown>;
    const entries = Object.entries(s);
    if (entries.length === 0) return "—";
    return entries
      .map(([key, val]) => `${key}: ${jsonToDisplayString(val)}`)
      .join("; ");
  } catch {
    return "—";
  }
}

/**
 * Exports line sheets to PDF.
 * Retrieves line sheet records, their projects, profile, and product images
 * via signed URLs, then generates a professional catalogue-style PDF.
 */
export async function exportLineSheetPDF(
  lineSheetIds: string[],
  projectId: string,
  userId: string
) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  // Fetch line sheets (RLS ensures user owns them via project)
  const { data: lineSheets, error: lsError } = await supabase
    .from("line_sheets")
    .select("*")
    .eq("project_id", projectId)
    .in("id", lineSheetIds);

  if (lsError || !lineSheets) {
    return errorResult(lsError?.message || "Line sheets not found", "not_found");
  }

  if (lineSheets.length === 0) {
    return errorResult("No line sheets found", "not_found");
  }

  // Fetch project
  const { data: project, error: pError } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (pError || !project) {
    return errorResult(pError?.message || "Project not found", "not_found");
  }

  // Fetch profile for brand info
  const { data: profile } = await supabase
    .from("profiles")
    .select("brand_name, full_name")
    .eq("id", userId)
    .single();

  // Get signed URLs for product images
  const imageInfos: Record<string, ImageInfo | null> = {};
  for (const ls of lineSheets) {
    if (ls.product_image_url) {
      const urlResult = await getSignedFileUrl(
        "line-sheet-assets",
        ls.product_image_url,
        300
      );
      if (urlResult.success && urlResult.data?.url) {
        imageInfos[ls.id] = {
          url: urlResult.data.url,
          width: 200,
          height: 200,
          alt: "Product image",
        };
      }
    }
  }

  const brandName = profile?.brand_name || profile?.full_name || "FashionTech AI";
  const docTitle = `Line Sheet`;
  const docSubtitle = `Collection: ${project.name}`;

  const pdf = createPDFDocument({
    title: docTitle,
    subtitle: docSubtitle,
    brandName,
  });

  // Color constants matching pdf.ts
  const C_TEXT_PRIMARY = [15, 23, 42];
  const C_TEXT_MUTED = [148, 163, 184];

  // Process each line sheet
  for (let i = 0; i < lineSheets.length; i++) {
    const ls = lineSheets[i];

    // Add page break between line sheets (except first)
    if (i > 0) {
      pdf.doc.addPage();
    }

    pdf.addHeader();

    let y = pdf.margin * 0.8 + 18;

    // Collection title
    pdf.doc.setTextColor(C_TEXT_PRIMARY[0], C_TEXT_PRIMARY[1], C_TEXT_PRIMARY[2]);
    pdf.doc.setFont("helvetica", "bold");
    pdf.doc.setFontSize(16);
    pdf.doc.text(ls.collection_title || "Untitled Collection", pdf.margin, y);
    y += 10;

    // Season
    if (ls.season) {
      pdf.doc.setFont("helvetica", "normal");
      pdf.doc.setFontSize(10);
      pdf.doc.setTextColor(C_TEXT_MUTED[0], C_TEXT_MUTED[1], C_TEXT_MUTED[2]);
      pdf.doc.text(`Season: ${ls.season}`, pdf.margin, y);
      y += 8;
    }

    // Product image
    y = pdf.addSectionHeading("Product Image", y);
    const imgInfo = imageInfos[ls.id];
    if (imgInfo) {
      y = await pdf.addImage(imgInfo, y, 50);
    } else {
      y = pdf.addBodyText("No product image uploaded.", y, 9, 5);
      y += 4;
    }

    // Styles
    y = pdf.addSectionHeading("Style Details", y);
    y = pdf.addBodyText(formatStyles(ls.styles), y);

    y += 4;

    // Date
    pdf.doc.setTextColor(C_TEXT_MUTED[0], C_TEXT_MUTED[1], C_TEXT_MUTED[2]);
    pdf.doc.setFont("helvetica", "normal");
    pdf.doc.setFontSize(8);
    pdf.doc.text(
      `Generated on ${new Date().toLocaleDateString()} by ${brandName}`,
      pdf.margin,
      y
    );
  }

  const blob = pdf.finalize();
  const fileName = `line-sheet-${project.name.toLowerCase().replace(/\s+/g, "-")}-${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;

  return successResult({ blob, fileName, type: "application/pdf" });
}

export type { LineSheet };
