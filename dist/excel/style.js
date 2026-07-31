"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExcelStyle = createExcelStyle;
exports.styleCellImpl = styleCellImpl;
exports.setValueImpl = setValueImpl;
exports.setFormulaImpl = setFormulaImpl;
exports.getCellTextImpl = getCellTextImpl;
function createExcelStyle(opts = {}) {
    return {
        HEADER_FILL: opts.HEADER_FILL ?? "FFF2CC",
        HEADER_COLOR: opts.HEADER_COLOR ?? "000000",
        RESULT_FILL: opts.RESULT_FILL ?? "D9EAD3",
        RESULT_COLOR: opts.RESULT_COLOR ?? "000000",
        ALT_ROW_FILL: opts.ALT_ROW_FILL ?? "FFF9F0",
        REGRET_FILL: opts.REGRET_FILL ?? "FCE4D6",
        FONT_NAME: opts.FONT_NAME ?? "Times New Roman",
        FONT_SIZE: opts.FONT_SIZE ?? 14,
        TAB_COLOR: opts.TAB_COLOR ?? "FFF2CC",
        DEFAULT_ROW_HEIGHT: opts.DEFAULT_ROW_HEIGHT ?? 20,
        PAGE_ORIENTATION: opts.PAGE_ORIENTATION ?? "landscape",
        FIT_TO_PAGE: opts.FIT_TO_PAGE ?? true,
        FIT_TO_WIDTH: opts.FIT_TO_WIDTH ?? 1,
        FIT_TO_HEIGHT: opts.FIT_TO_HEIGHT ?? 0,
        MAX_COLUMN_WIDTH: opts.MAX_COLUMN_WIDTH ?? 80,
        MAX_ROW_HEIGHT: opts.MAX_ROW_HEIGHT ?? 120,
        ROW_HEIGHT_FONT_MULTIPLIER: opts.ROW_HEIGHT_FONT_MULTIPLIER ?? 1.9,
        HEADER_TITLE_SIZE: opts.HEADER_TITLE_SIZE ?? 14,
        BORDER_STYLE: opts.BORDER_STYLE ?? "thin",
    };
}
/** Applies font, alignment, fill, border, and numFmt to a cell. */
function styleCellImpl(cell, options = {}, st) {
    cell.font = {
        name: options.fontName ?? st.FONT_NAME,
        size: options.size ?? st.FONT_SIZE,
        bold: Boolean(options.bold),
        color: options.color ? { argb: options.color } : undefined,
    };
    cell.alignment = {
        vertical: "middle",
        horizontal: options.align ?? "center",
        wrapText: options.wrapText !== false,
    };
    if (options.fill) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: options.fill } };
    }
    if (options.border) {
        const borderStyle = typeof options.border === "string" ? options.border : st.BORDER_STYLE;
        cell.border = {
            top: { style: borderStyle },
            left: { style: borderStyle },
            bottom: { style: borderStyle },
            right: { style: borderStyle },
        };
    }
    if (options.numFmt) {
        cell.numFmt = options.numFmt;
    }
}
/** Writes a value to a cell and applies style. */
function setValueImpl(sheet, address, value, options, st) {
    const cell = sheet.getCell(address);
    cell.value = value;
    styleCellImpl(cell, options, st);
    return cell;
}
/** Writes a formula to a cell and applies style. */
function setFormulaImpl(sheet, address, formula, options, st) {
    const cell = sheet.getCell(address);
    cell.value = { formula };
    styleCellImpl(cell, options, st);
    return cell;
}
/** Extracts plain text from a cell (returns "" for formula cells — no cached value in ExcelJS). */
function getCellTextImpl(cell) {
    if (!cell || cell.value === null || cell.value === undefined)
        return "";
    if (typeof cell.value === "object" && "formula" in cell.value)
        return "";
    if (typeof cell.value === "object" && "text" in cell.value)
        return String(cell.value.text);
    return String(cell.text || cell.value);
}
