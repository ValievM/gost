"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCell = normalizeCell;
exports.tableColumnWidths = tableColumnWidths;
exports.tableCellImpl = tableCellImpl;
exports.makeTableImpl = makeTableImpl;
const docx_1 = require("docx");
const paragraph_1 = require("./paragraph");
const math_1 = require("./math");
function normalizeCell(cell) {
    if (typeof cell === "object" && cell !== null && !Array.isArray(cell) && !(0, math_1.isMathLike)(cell) && "text" in cell) {
        return cell;
    }
    return { text: cell };
}
function tableColumnWidths(st, count, widths) {
    if (!Number.isInteger(count) || count <= 0) {
        throw new Error("makeTable(): table must contain at least one logical column.");
    }
    if (Array.isArray(widths) && widths.length > 0) {
        if (widths.length !== count) {
            throw new Error(`makeTable(): widths must contain ${count} values, received ${widths.length}.`);
        }
        if (widths.some((width) => !Number.isFinite(width) || width <= 0)) {
            throw new Error("makeTable(): every column width must be a positive number.");
        }
        return [...widths];
    }
    const base = Math.floor(st.CONTENT_WIDTH / count);
    const result = Array(count).fill(base);
    result[result.length - 1] += st.CONTENT_WIDTH - result.reduce((sum, width) => sum + width, 0);
    return result;
}
function cellColumnSpan(cell) {
    const span = normalizeCell(cell).colspan ?? 1;
    if (!Number.isInteger(span) || span <= 0) {
        throw new Error("makeTable(): colspan must be a positive integer.");
    }
    return span;
}
function rowColumnCount(row) {
    return row.reduce((count, cell) => count + cellColumnSpan(cell), 0);
}
function tableCellImpl(st, cell, width, opts) {
    const normalized = normalizeCell(cell);
    const content = normalized.text ?? "";
    const align = normalized.align ?? opts.align;
    const bold = normalized.bold !== undefined ? normalized.bold : opts.bold;
    const children = Array.isArray(content) || (0, math_1.isMathLike)(content)
        ? [(0, math_1.paragraphWithMathImpl)(st, Array.isArray(content) ? content : [content], {
                align,
                noIndent: true,
                line: opts.cellLine ?? st.TABLE_CELL_LINE,
                size: normalized.size ?? opts.fontSize,
                bold,
                italics: normalized.italics,
                color: normalized.color,
                font: normalized.font,
            })]
        : [new docx_1.Paragraph({
                alignment: align,
                spacing: { line: opts.cellLine ?? st.TABLE_CELL_LINE, before: 0, after: 0 },
                children: [(0, paragraph_1.runImpl)(st, String(content), {
                        size: normalized.size ?? opts.fontSize,
                        bold,
                        italics: normalized.italics,
                        color: normalized.color,
                        font: normalized.font,
                    })],
            })];
    return new docx_1.TableCell({
        borders: opts.borders ?? st.BORDERS_ALL,
        width: { size: width, type: docx_1.WidthType.DXA },
        verticalAlign: docx_1.VerticalAlign.CENTER,
        margins: st.TABLE_CELL_MARGINS,
        columnSpan: normalized.colspan,
        rowSpan: normalized.rowspan,
        shading: normalized.shading,
        children,
    });
}
function makeTableImpl(st, rows, opts = {}) {
    if (rows.length === 0 || rows.some((row) => row.length === 0)) {
        throw new Error("makeTable(): rows and cells must not be empty.");
    }
    const count = rows.reduce((max, row) => Math.max(max, rowColumnCount(row)), 0);
    const effectiveStyle = opts.contentWidth ? { ...st, CONTENT_WIDTH: opts.contentWidth } : st;
    const widths = tableColumnWidths(effectiveStyle, count, opts.widths);
    const headerRow = opts.headerRow ?? 0;
    const defaultAlign = opts.align ?? docx_1.AlignmentType.JUSTIFIED;
    const centerHeader = opts.centerHeader !== undefined ? opts.centerHeader : true;
    return new docx_1.Table({
        width: { size: effectiveStyle.CONTENT_WIDTH, type: docx_1.WidthType.DXA },
        columnWidths: widths,
        rows: rows.map((row, rowIndex) => {
            const isHeader = rowIndex === headerRow;
            let columnIndex = 0;
            return new docx_1.TableRow({
                children: row.map((cell) => {
                    const span = cellColumnSpan(cell);
                    const width = widths
                        .slice(columnIndex, columnIndex + span)
                        .reduce((sum, value) => sum + value, 0);
                    columnIndex += span;
                    return tableCellImpl(st, cell, width, {
                        ...opts,
                        align: isHeader && centerHeader ? docx_1.AlignmentType.CENTER : defaultAlign,
                        bold: isHeader,
                        fontSize: opts.fontSize ?? st.SIZE,
                        borders: opts.borders ?? st.BORDERS_ALL,
                    });
                }),
            });
        }),
    });
}
