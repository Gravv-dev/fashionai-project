/**
 * FashionTech AI - Flat Sketch Export Service
 *
 * Generates PDF exports for flat sketch records.
 * Retrieves private images via signed URLs and handles missing data gracefully.
 */

import { createPDFDocument, type ImageInfo } from "@/lib/services/exports/pdf";
import { getSignedFileUrl } from "@/lib/services/storage";
import { createClient } from "@/lib/supabase";
import type { FlatSketch } from "@/types/database";

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
 * Exports a flat sketch to PDF.
 * Retrieves the flat sketch record, its project, profile, and source image
 * via signed URL, then generates a professional PDF document.
 */
export async function exportFlatSketchPDF(
  flatSketchId: string,
  projectId: string,
  userId: string
) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  // Fetch flat sketch (RLS ensures user owns it via project)
  const { data: flatSketch, error: fsError } = await supabase
    .from("flat_sketches")
    .select("*")
    .eq("id", flatSketchId)
    .eq("project_id", projectId)
    .single();

  if (fsError || !flatSketch) {
    return errorResult(fsError?.message || "Flat sketch not found", "not_found");
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

  // Get signed URL for source image if present
  let sourceImageInfo: ImageInfo | null = null;
  if (flatSketch.source_image_url) {
    const urlResult = await getSignedFileUrl(
      "flat-sketches",
      flatSketch.source_image_url,
      300
    );
    if (urlResult.success && urlResult.data?.url) {
      sourceImageInfo = {
        url: urlResult.data.url,
        width: 400,
        height: 400,
        alt: "Source image",
      };
    }
  }

  const brandName = profile?.brand_name || profile?.full_name || "FashionTech AI";
  const docTitle = `Flat Sketch - ${flatSketch.id.slice(0, 8)}`;
  const docSubtitle = `Project: ${project.name}`;

  const pdf = createPDFDocument({
    title: docTitle,
    subtitle: docSubtitle,
    brandName,
  });

  pdf.addHeader();

  let y = pdf.margin * 0.8 + 18;

  // Section: Document Header Info
  y = pdf.addSectionHeading("Flat Sketch Details", y);
  y = pdf.addFieldRow("Project", project.name, y);
  y = pdf.addFieldRow("View", (flatSketch.view || "front").charAt(0).toUpperCase() + (flatSketch.view || "front").slice(1), y);
  y = pdf.addDivider(y);

  // Section: Source Image
  y = pdf.addSectionHeading("Source Image", y);
  if (sourceImageInfo) {
    y = await pdf.addImage(sourceImageInfo, y, 70);
  } else {
    y = pdf.addBodyText("No source image uploaded.", y, 9, 5);
    y += 4;
  }

  // Section: Generated Sketch Info
  y = pdf.addSectionHeading("Generated Sketch", y);
  if (flatSketch.generated_sketch_url) {
    y = pdf.addFieldRow("Generated Sketch URL", flatSketch.generated_sketch_url, y);
  } else {
    y = pdf.addBodyText("No generated sketch available.", y, 9, 5);
    y += 4;
  }

  if (flatSketch.svg_url) {
    y = pdf.addFieldRow("SVG URL", flatSketch.svg_url, y);
  }

  // Footer info
  y = pdf.addDivider(y);
  y = pdf.addBodyText(
    `Generated on ${new Date().toLocaleDateString()} by ${brandName}`,
    y,
    8,
    4
  );

  const blob = pdf.finalize();
  const fileName = `flat-sketch-${flatSketch.id.slice(0, 8)}-${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;

  return successResult({ blob, fileName, type: "application/pdf" });
}

export type { FlatSketch };
