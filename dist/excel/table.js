"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyZebraStripingImpl = applyZebraStripingImpl;
exports.formatTableRangeImpl = formatTableRangeImpl;
const style_1 = require("./style");
/** Applies alternating row fill (zebra striping) to a range, skipping header/result cells. */
function applyZebraStripingImpl(sheet, startRow, endRow, startCol, endCol, headerRows = new Set(), st) {
    for (let row = startRow; row <= endRow; row += 1) {
        if (headerRows.has(row) || row % 2 !== 0)
            continue;
        for (let col = startCol; col <= endCol; col += 1) {
            const cell = sheet.getCell(row, col);
            const fill = cell.fill;
            const existingFill = fill?.fgColor?.argb;
            if (existingFill === st.HEADER_FILL || existingFill === st.RESULT_FILL)
                continue;
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: st.ALT_ROW_FILL } };
        }
    }
}
/**
 * Applies borders to a range and header fill to the header row.
 * Skips cells that already have HEADER_FILL or RESULT_FILL (preserves ROW_HEADER_STYLE).
 */
function formatTableRangeImpl(sheet, startRow, endRow, startCol, endCol, headerRow, st) {
    for (let row = startRow; row <= endRow; row += 1) {
        for (let col = startCol; col <= endCol; col += 1) {
            const cell = sheet.getCell(row, col);
            const existingFill = cell.fill?.fgColor?.argb;
            const hasHeaderFill = existingFill === st.HEADER_FILL || existingFill === st.RESULT_FILL;
            if (hasHeaderFill) {
                const bs = st.BORDER_STYLE;
                cell.border = { top: { style: bs }, left: { style: bs }, bottom: { style: bs }, right: { style: bs } };
                continue;
            }
            (0, style_1.styleCellImpl)(cell, {
                border: true,
                bold: row === headerRow,
                fill: row === headerRow ? st.HEADER_FILL : undefined,
                color: row === headerRow ? st.HEADER_COLOR : undefined,
            }, st);
        }
    }
}
//# sourceMappingURL=table.js.map