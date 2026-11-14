/**
 * FashionTech AI - PDF Export Utilities
 *
 * Provides reusable helper functions for generating professional PDF documents
 * using jsPDF. Handles fonts, headers, footers, page numbering, image embedding,
 * and section layout consistent with the fashion-tech design system.
 */

import jsPDF from "jspdf";

interface PDFConfig {
  title: string;
  subtitle?: string;
  brandName?: string;
  pageSize?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
}

interface ImageInfo {
  url: string;
  width: number;
  height: number;
  alt?: string;
}

/**
 * Creates a new jsPDF document with default fashion-tech styling.
 * Returns the jsPDF instance and a helper object for adding content.
 */
export function createPDFDocument(config: PDFConfig) {
  const { title, subtitle, brandName, pageSize = "a4", orientation = "portrait" } = config;

  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: pageSize,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // Fashion Tech AI color palette
  const C_BRAND = [15, 23, 42];        // deep ink #0f172a
  const C_ACCENT = [192, 132, 151];    // muted rose-gold #c08497
  const C_SURFACE = [250, 250, 249];   // #fafaf9
  const C_BORDER = [231, 229, 228];    // #e7e5e4
  const C_TEXT_PRIMARY = [15, 23, 42];  // #0f172a
  const C_TEXT_SECONDARY = [71, 85, 105]; // #475569
  const C_TEXT_MUTED = [148, 163, 184]; // #94a3b8

  let pageNumber = 0;

  /**
   * Adds a header with brand name, document title, and page number.
   */
  const addHeader = () => {
    pageNumber++;
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, margin * 0.8, "F");

    // Brand logo area
    doc.setFillColor(C_BRAND[0], C_BRAND[1], C_BRAND[2]);
    doc.roundedRect(margin, margin * 0.4, 16, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("FT", margin + 4, margin * 0.4 + 5.5);

    // Document title
    doc.setTextColor(C_TEXT_PRIMARY[0], C_TEXT_PRIMARY[1], C_TEXT_PRIMARY[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title, margin + 22, margin * 0.4 + 5.5);

    if (subtitle) {
      doc.setTextColor(C_TEXT_MUTED[0], C_TEXT_MUTED[1], C_TEXT_MUTED[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(subtitle, margin + 22, margin * 0.4 + 9.5);
    }

    // Brand name (right side)
    if (brandName) {
      doc.setTextColor(C_TEXT_SECONDARY[0], C_TEXT_SECONDARY[1], C_TEXT_SECONDARY[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const brandWidth = doc.getTextWidth(brandName);
      doc.text(brandName, pageWidth - margin - brandWidth, margin * 0.4 + 5.5);
    }

    // Page number (bottom)
    doc.setTextColor(C_TEXT_MUTED[0], C_TEXT_MUTED[1], C_TEXT_MUTED[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const pageText = `Page ${pageNumber}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - margin * 0.4 + 2);

    // Footer line
    doc.setDrawColor(C_BORDER[0], C_BORDER[1], C_BORDER[2]);
    doc.line(margin, pageHeight - margin * 0.4, pageWidth - margin, pageHeight - margin * 0.4);
  };

  /**
   * Adds a section heading with accent color underline.
   */
  const addSectionHeading = (text: string, y: number) => {
    doc.setFillColor(C_ACCENT[0], C_ACCENT[1], C_ACCENT[2]);
    doc.roundedRect(margin, y, 4, 8, 2, 2, "F");
    doc.setTextColor(C_TEXT_PRIMARY[0], C_TEXT_PRIMARY[1], C_TEXT_PRIMARY[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(text, margin + 8, y + 6);
    return y + 12;
  };

  /**
   * Adds a paragraph of body text with wrapping.
   */
  const addBodyText = (text: string, y: number, fontSize = 9.5, lineHeight = 5.5) => {
    doc.setTextColor(C_TEXT_PRIMARY[0], C_TEXT_PRIMARY[1], C_TEXT_PRIMARY[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, y);
    return y + lines.length * lineHeight + 4;
  };

  /**
   * Adds a labeled field row (label + value).
   */
  const addFieldRow = (label: string, value: string, y: number, valueFontSize = 9.5) => {
    doc.setTextColor(C_TEXT_SECONDARY[0], C_TEXT_SECONDARY[1], C_TEXT_SECONDARY[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(label, margin, y);

    doc.setTextColor(C_TEXT_PRIMARY[0], C_TEXT_PRIMARY[1], C_TEXT_PRIMARY[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(valueFontSize);
    const valueLines = doc.splitTextToSize(value, contentWidth - doc.getTextWidth(label) - 20);
    doc.text(valueLines, margin + doc.getTextWidth(label) + 8, y);
    return y + Math.max(valueLines.length, 1) * 5.5 + 3;
  };

  /**
   * Adds an image to the document, scaling to fit content width while maintaining aspect ratio.
   * Returns the new Y position after the image.
   */
  const addImage = async (imgInfo: ImageInfo, y: number, maxHeight = 60) => {
    const { url, width: imgWidth, height: imgHeight } = imgInfo;
    const aspectRatio = imgHeight / imgWidth;
    let displayWidth = contentWidth;
    let displayHeight = contentWidth * aspectRatio;

    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = maxHeight / aspectRatio;
    }

    const x = margin + (contentWidth - displayWidth) / 2;

    try {
      doc.addImage(url, "JPEG", x, y, displayWidth, displayHeight, undefined, "NONE");
    } catch {
      // If image fails to load, draw a placeholder
      doc.setDrawColor(C_BORDER[0], C_BORDER[1], C_BORDER[2]);
      doc.setFillColor(C_SURFACE[0], C_SURFACE[1], C_SURFACE[2]);
      doc.roundedRect(x, y, displayWidth, displayHeight, 2, 2, "FD");
      doc.setTextColor(C_TEXT_MUTED[0], C_TEXT_MUTED[1], C_TEXT_MUTED[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Image not available", x + displayWidth / 2 - 20, y + displayHeight / 2, { align: "center" });
    }

    return y + displayHeight + 6;
  };

  /**
   * Adds a horizontal divider line.
   */
  const addDivider = (y: number) => {
    doc.setDrawColor(C_BORDER[0], C_BORDER[1], C_BORDER[2]);
    doc.line(margin, y, pageWidth - margin, y);
    return y + 6;
  };

  /**
   * Finalizes the document and returns a blob.
   */
  const finalize = () => {
    return doc.output("blob");
  };

  return {
    doc,
    pageWidth,
    pageHeight,
    margin,
    contentWidth,
    addHeader,
    addSectionHeading,
    addBodyText,
    addFieldRow,
    addImage,
    addDivider,
    finalize,
  };
}

export type { PDFConfig, ImageInfo };
