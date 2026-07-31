import { AlignmentType, Paragraph, Table, TableCell, TableRow, VerticalAlign, WidthType } from "docx";
import type { DocxStyleConfig, TableOpts, CellValue, CellDescriptor, MathContent, RunDescriptor } from "./types";
import { runImpl } from "./paragraph";
import { paragraphWithMathImpl, isMathLike } from "./math";

export function normalizeCell(cell: CellValue): CellDescriptor {
  if (typeof cell === "object" && cell !== null && !Array.isArray(cell) && !isMathLike(cell) && "text" in cell) {
    return cell as CellDescriptor;
  }
  return { text: cell };
}

export function tableColumnWidths(st: DocxStyleConfig, count: number, widths?: number[]): number[] {
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

function cellColumnSpan(cell: CellValue): number {
  const span = normalizeCell(cell).colspan ?? 1;
  if (!Number.isInteger(span) || span <= 0) {
    throw new Error("makeTable(): colspan must be a positive integer.");
  }
  return span;
}

function rowColumnCount(row: CellValue[]): number {
  return row.reduce<number>((count, cell) => count + cellColumnSpan(cell), 0);
}

export function tableCellImpl(st: DocxStyleConfig, cell: CellValue, width: number, opts: TableOpts & { bold?: boolean }): TableCell {
  const normalized = normalizeCell(cell);
  const content = normalized.text ?? "";
  const align = normalized.align ?? opts.align;
  const bold = normalized.bold !== undefined ? normalized.bold : opts.bold;
  const children = Array.isArray(content) || isMathLike(content)
    ? [paragraphWithMathImpl(st, Array.isArray(content) ? content as Array<string | number | RunDescriptor | MathContent> : [content], {
      align,
      noIndent: true,
      line: opts.cellLine ?? st.TABLE_CELL_LINE,
      size: normalized.size ?? opts.fontSize,
      bold,
      italics: normalized.italics,
      color: normalized.color,
      font: normalized.font,
    })]
    : [new Paragraph({
      alignment: align as (typeof AlignmentType)[keyof typeof AlignmentType],
      spacing: { line: opts.cellLine ?? st.TABLE_CELL_LINE, before: 0, after: 0 },
      children: [runImpl(st, String(content), {
        size: normalized.size ?? opts.fontSize,
        bold,
        italics: normalized.italics,
        color: normalized.color,
        font: normalized.font,
      })],
    })];
  return new TableCell({
    borders: opts.borders ?? st.BORDERS_ALL,
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: st.TABLE_CELL_MARGINS,
    columnSpan: normalized.colspan,
    rowSpan: normalized.rowspan,
    shading: normalized.shading,
    children,
  });
}

export function makeTableImpl(st: DocxStyleConfig, rows: CellValue[][], opts: TableOpts = {}): Table {
  if (rows.length === 0 || rows.some((row) => row.length === 0)) {
    throw new Error("makeTable(): rows and cells must not be empty.");
  }

  const count = rows.reduce((max, row) => Math.max(max, rowColumnCount(row)), 0);
  const effectiveStyle = opts.contentWidth ? { ...st, CONTENT_WIDTH: opts.contentWidth } : st;
  const widths = tableColumnWidths(effectiveStyle, count, opts.widths);
  const headerRow = opts.headerRow ?? 0;
  const defaultAlign = opts.align ?? AlignmentType.JUSTIFIED;
  const centerHeader = opts.centerHeader !== undefined ? opts.centerHeader : true;
  return new Table({
    width: { size: effectiveStyle.CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((row, rowIndex) => {
      const isHeader = rowIndex === headerRow;
      let columnIndex = 0;
      return new TableRow({
        children: row.map((cell) => {
          const span = cellColumnSpan(cell);
          const width = widths
            .slice(columnIndex, columnIndex + span)
            .reduce((sum, value) => sum + value, 0);
          columnIndex += span;
          return tableCellImpl(st, cell, width, {
            ...opts,
            align: isHeader && centerHeader ? AlignmentType.CENTER : defaultAlign,
            bold: isHeader,
            fontSize: opts.fontSize ?? st.SIZE,
            borders: opts.borders ?? st.BORDERS_ALL,
          });
        }),
      });
    }),
  });
}
