import { Table, TableCell } from "docx";
import type { DocxStyleConfig, TableOpts, CellValue, CellDescriptor } from "./types";
export declare function normalizeCell(cell: CellValue): CellDescriptor;
export declare function tableColumnWidths(st: DocxStyleConfig, count: number, widths?: number[]): number[];
export declare function tableCellImpl(st: DocxStyleConfig, cell: CellValue, width: number, opts: TableOpts & {
    bold?: boolean;
}): TableCell;
export declare function makeTableImpl(st: DocxStyleConfig, rows: CellValue[][], opts?: TableOpts): Table;
//# sourceMappingURL=table.d.ts.map