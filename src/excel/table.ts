import ExcelJS from "exceljs";
import type { ExcelStyleConfig } from "./types";
import { styleCellImpl } from "./style";

/** Applies alternating row fill (zebra striping) to a range, skipping header/result cells. */
export function applyZebraStripingImpl(
    sheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
    startCol: number,
    endCol: number,
    headerRows = new Set<number>(),
    st: ExcelStyleConfig,
): void {
    for (let row = startRow; row <= endRow; row += 1) {
        if (headerRows.has(row) || row % 2 !== 0) continue;
        for (let col = startCol; col <= endCol; col += 1) {
            const cell = sheet.getCell(row, col);
            const fill = cell.fill as Partial<ExcelJS.FillPattern> | undefined;
            const existingFill = fill?.fgColor?.argb;
            if (existingFill === st.HEADER_FILL || existingFill === st.RESULT_FILL) continue;
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: st.ALT_ROW_FILL } };
        }
    }
}

/**
 * Applies borders to a range and header fill to the header row.
 * Skips cells that already have HEADER_FILL or RESULT_FILL (preserves ROW_HEADER_STYLE).
 */
export function formatTableRangeImpl(
    sheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
    startCol: number,
    endCol: number,
    headerRow: number,
    st: ExcelStyleConfig,
): void {
    for (let row = startRow; row <= endRow; row += 1) {
        for (let col = startCol; col <= endCol; col += 1) {
            const cell = sheet.getCell(row, col);
            const existingFill = (cell.fill as Partial<ExcelJS.FillPattern> | undefined)?.fgColor?.argb;
            const hasHeaderFill = existingFill === st.HEADER_FILL || existingFill === st.RESULT_FILL;
            if (hasHeaderFill) {
                const bs = st.BORDER_STYLE as ExcelJS.BorderStyle;
                cell.border = { top: { style: bs }, left: { style: bs }, bottom: { style: bs }, right: { style: bs } } as Partial<ExcelJS.Borders>;
                continue;
            }
            styleCellImpl(cell, {
                border: true,
                bold: row === headerRow,
                fill: row === headerRow ? st.HEADER_FILL : undefined,
                color: row === headerRow ? st.HEADER_COLOR : undefined,
            }, st);
        }
    }
}
