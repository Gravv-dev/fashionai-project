/**
 * FashionTech AI - Excel Export Utilities
 *
 * Provides reusable helper functions for generating professional Excel workbooks
 * using ExcelJS. Handles styles, formatting, column widths, and sheet creation
 * consistent with the fashion-tech design system.
 */

import ExcelJS from "exceljs";

// Fashion Tech AI color palette (ExcelJS uses ARGB hex strings)
const COLORS = {
  brand: "0F172A",        // deep ink
  brandLight: "1E293B",   // lighter brand
  accent: "C08497",       // muted rose-gold
  surface: "FAFAF9",      // near-white background
  border: "E7E5E4",       // light border
  textPrimary: "0F172A",  // deep ink
  textSecondary: "475569", // slate
  textMuted: "94A3B8",    // muted slate
  success: "15803D",      // green
};

/**
 * Converts a column number to an Excel column letter (1 -> A, 2 -> B, etc.)
 */
function getColumnLetter(col: number): string {
  let letter = "";
  while (col > 0) {
    const remainder = (col - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

interface ExcelConfig {
  title: string;
  companyName?: string;
}

/**
 * Creates a new Excel workbook with default fashion-tech styling.
 */
export function createExcelWorkbook(config: ExcelConfig) {
  const { title, companyName = "FashionTech AI" } = config;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = companyName;
  workbook.lastModifiedBy = companyName;
  workbook.created = new Date();
  workbook.modified = new Date();

  return {
    workbook,
    COLORS,
    companyName,
  };
}

/**
 * Creates a standard header row with styling.
 */
export function createHeaderRow(
  worksheet: ExcelJS.Worksheet,
  headers: string[],
  rowNum = 1
) {
  const headerRow = worksheet.getRow(rowNum);
  headerRow.height = 24;

  headers.forEach((header, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = header;
    cell.font = {
      name: "Inter",
      size: 10,
      bold: true,
      color: { argb: "FFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.brand },
    };
    cell.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } },
    };
  });
}

/**
 * Creates a data row with alternating fill and standard styling.
 */
export function createDataRow(
  worksheet: ExcelJS.Worksheet,
  values: (string | number | boolean | null)[],
  rowNum: number,
  isAlternate = false
) {
  const row = worksheet.getRow(rowNum);
  row.height = 20;

  values.forEach((value, i) => {
    const cell = row.getCell(i + 1);
    cell.value = value;
    cell.font = {
      name: "Inter",
      size: 10,
      color: { argb: COLORS.textPrimary },
    };
    cell.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } },
    };

    if (isAlternate) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.surface },
      };
    }
  });
}

/**
 * Sets column widths based on header content.
 */
export function setColumnWidths(
  worksheet: ExcelJS.Worksheet,
  headers: string[]
) {
  headers.forEach((header, i) => {
    const columnLetter = getColumnLetter(i + 1);
    const width = Math.max(header.length + 4, 15);
    worksheet.getColumn(columnLetter).width = Math.min(width, 60);
  });
}

/**
 * Adds a title row to the worksheet.
 */
export function addTitleRow(
  worksheet: ExcelJS.Worksheet,
  titleText: string,
  rowNum = 1,
  companyName = "FashionTech AI"
) {
  const lastCol = getColumnLetter(10);
  worksheet.mergeCells(`A${rowNum}:${lastCol}${rowNum}`);
  const cell = worksheet.getCell(`A${rowNum}`);
  cell.value = titleText;
  cell.font = {
    name: "Inter",
    size: 16,
    bold: true,
    color: { argb: COLORS.brand },
  };
  cell.alignment = { horizontal: "left", vertical: "middle" };
  worksheet.getRow(rowNum).height = 30;

  // Add subtitle row
  if (companyName) {
    const subRow = rowNum + 1;
    worksheet.mergeCells(`A${subRow}:${lastCol}${subRow}`);
    const subCell = worksheet.getCell(`A${subRow}`);
    subCell.value = companyName;
    subCell.font = {
      name: "Inter",
      size: 10,
      color: { argb: COLORS.textMuted },
    };
    subCell.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(subRow).height = 18;
  }

  // Add date row
  const dateRow = rowNum + 2;
  worksheet.mergeCells(`A${dateRow}:${lastCol}${dateRow}`);
  const dateCell = worksheet.getCell(`A${dateRow}`);
  dateCell.value = `Export Date: ${new Date().toLocaleDateString()}`;
  dateCell.font = {
    name: "Inter",
    size: 9,
    color: { argb: COLORS.textMuted },
  };
  dateCell.alignment = { horizontal: "left", vertical: "middle" };
  worksheet.getRow(dateRow).height = 16;
}

/**
 * Adds a summary/info section below headers.
 */
export function addInfoSection(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  fields: { label: string; value: string }[]
) {
  let currentRow = startRow;
  fields.forEach((field) => {
    const labelCol = getColumnLetter(1);
    const valueCol = getColumnLetter(5);
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const labelCell = worksheet.getCell(`A${currentRow}`);
    labelCell.value = field.label;
    labelCell.font = {
      name: "Inter",
      size: 10,
      bold: true,
      color: { argb: COLORS.brand },
    };

    worksheet.mergeCells(`E${currentRow}:J${currentRow}`);
    const valueCell = worksheet.getCell(`E${currentRow}`);
    valueCell.value = field.value;
    valueCell.font = {
      name: "Inter",
      size: 10,
      color: { argb: COLORS.textPrimary },
    };
    valueCell.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(currentRow).height = 18;
    currentRow++;
  });
  return currentRow;
}

export type { ExcelConfig };
