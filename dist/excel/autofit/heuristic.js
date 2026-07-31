"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeuristicAutoFitter = void 0;
function getCellText(cell) {
    if (!cell || cell.value === null || cell.value === undefined)
        return "";
    if (typeof cell.value === "object" && "formula" in cell.value)
        return "";
    if (typeof cell.value === "object" && "text" in cell.value)
        return String(cell.value.text);
    return String(cell.text || cell.value);
}
function buildMergeSpans(sheet) {
    const mergeSpans = new Map();
    const model = sheet.model;
    (model?.merges ?? []).forEach((range) => {
        const match = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
        if (!match)
            return;
        const startColIdx = sheet.getColumn(match[1]).number;
        const endColIdx = sheet.getColumn(match[3]).number;
        mergeSpans.set(`${match[1]}${match[2]}`, { startColIdx, endColIdx, span: endColIdx - startColIdx + 1 });
    });
    return mergeSpans;
}
/**
 * Estimates column widths and row heights based on character count.
 *
 * Fundamental limitations:
 *  - Character width ≠ pixel width (W ≫ i, Cyrillic > Latin)
 *  - Formula cells have no cached value → not included in width estimation
 *
 * For pixel-accurate sizing, use CanvasAutoFitter or GoogleSheetsAutoFitter.
 */
class HeuristicAutoFitter {
    fitSheet(sheet, st) {
        const baseWidths = sheet._baseWidths ?? [];
        const maxColumn = Math.max(sheet.columnCount, baseWidths.length);
        const computedWidths = Array.from({ length: maxColumn }, (_, i) => baseWidths[i] || 10);
        const mergeSpans = buildMergeSpans(sheet);
        // Pass 1: column widths
        for (let columnIndex = 1; columnIndex <= maxColumn; columnIndex += 1) {
            sheet.eachRow({ includeEmpty: false }, (row) => {
                const text = getCellText(row.getCell(columnIndex)).trim();
                if (!text)
                    return;
                const longest = text.split(/\r?\n/).reduce((max, line) => Math.max(max, line.length), 0);
                // Long text wraps within base column width — don't blow up the column
                if (longest > 40)
                    return;
                const padding = columnIndex === 1 ? 4 : 2;
                computedWidths[columnIndex - 1] = Math.min(st.MAX_COLUMN_WIDTH, Math.max(computedWidths[columnIndex - 1], longest + padding));
            });
        }
        computedWidths.forEach((width, index) => { sheet.getColumn(index + 1).width = width; });
        // Pass 2: row heights
        sheet.eachRow({ includeEmpty: false }, (row) => {
            let rowHeight = sheet.properties.defaultRowHeight || st.DEFAULT_ROW_HEIGHT;
            row.eachCell({ includeEmpty: false }, (cell) => {
                const text = getCellText(cell).trim();
                if (!text)
                    return;
                const isMergedMaster = cell.master && cell.master.address === cell.address;
                const mergeMeta = isMergedMaster ? mergeSpans.get(cell.address) : null;
                const columnWidth = mergeMeta
                    ? Array.from({ length: mergeMeta.span }, (_, idx) => sheet.getColumn(mergeMeta.startColIdx + idx).width || 10).reduce((acc, w) => acc + w, 0)
                    : (sheet.getColumn(cell.col).width || 10);
                const fontSize = cell.font?.size || st.FONT_SIZE;
                const estimatedLines = text.split(/\r?\n/).reduce((total, line) => {
                    const charsPerLine = Math.max(1, Math.floor(columnWidth * 1.2));
                    return total + Math.max(1, Math.ceil(line.length / charsPerLine));
                }, 0);
                rowHeight = Math.max(rowHeight, Math.max(st.DEFAULT_ROW_HEIGHT, estimatedLines * Math.max(18, fontSize * st.ROW_HEIGHT_FONT_MULTIPLIER)));
            });
            row.height = Math.min(st.MAX_ROW_HEIGHT, rowHeight);
        });
    }
}
exports.HeuristicAutoFitter = HeuristicAutoFitter;
