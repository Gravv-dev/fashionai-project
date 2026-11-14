# Phase 2, Step 5 Implementation Plan

## Libraries to Install
- `jspdf` - PDF generation (client-side)
- `exceljs` - Excel workbook generation (client-side)
- `@types/jspdf` - TypeScript types for jsPDF

## Files to Create
1. `src/lib/services/exports/pdf.ts` - PDF document utilities (fonts, headers, footers, page numbers, image handling)
2. `src/lib/services/exports/excel.ts` - Excel workbook utilities (styles, sheets, formatting)
3. `src/lib/services/exports/techpack-export.ts` - Tech pack PDF + Excel export
4. `src/lib/services/exports/flatsketch-export.ts` - Flat sketch PDF export
5. `src/lib/services/exports/line-sheet-export.ts` - Line sheet PDF export
6. `src/lib/services/exports/index.ts` - Barrel export

## Files to Modify
1. `src/lib/services/index.ts` - Export export services
2. `src/app/(app)/techpack/page.tsx` - Add PDF/Excel export buttons
3. `src/app/(app)/flatsketch/page.tsx` - Add PDF export button
4. `src/app/(app)/line-sheet/page.tsx` - Add PDF export button

## Data Available for Export (from existing schema)

Tech Pack: project_id, garment_type, size_range, measurements (JSON), bom (JSON), construction_notes, flat_sketch_url, reference_image_url
Flat Sketch: project_id, source_image_url, generated_sketch_url, svg_url, view
Line Sheet: project_id, collection_title, season, styles (JSON), pdf_url, product_image_url
Project: id, user_id, name, description, type, status, thumbnail_url
Profile: id, email, full_name, brand_name, brand_contact, sizing_system, size_range

## Missing Schema Fields (documented, not faked)
- Tech pack: measurements, bom stored as JSON - export will include them if present
- Flat sketch: SVG export URL - include if present
- Line sheet: styles JSON - include if present
- Brand name on tech pack - comes from linked profile

## Security
- All exports require authenticated user
- RLS already enforced on all table reads
- Signed URLs used for private image access
- No service-role keys exposed
- Downloads happen client-side via browser
