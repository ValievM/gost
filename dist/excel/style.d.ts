import ExcelJS from "exceljs";
import type { ExcelStyleConfig, CellStyleOptions } from "./types";
export declare function createExcelStyle(opts?: Partial<ExcelStyleConfig>): ExcelStyleConfig;
/** Applies font, alignment, fill, border, and numFmt to a cell. */
export declare function styleCellImpl(cell: ExcelJS.Cell, options: CellStyleOptions | undefined, st: ExcelStyleConfig): void;
/** Writes a value to a cell and applies style. */
export declare function setValueImpl(sheet: ExcelJS.Worksheet, address: string, value: unknown, options: CellStyleOptions, st: ExcelStyleConfig): ExcelJS.Cell;
/** Writes a formula to a cell and applies style. */
export declare function setFormulaImpl(sheet: ExcelJS.Worksheet, address: string, formula: string, options: CellStyleOptions, st: ExcelStyleConfig): ExcelJS.Cell;
/** Extracts plain text from a cell (returns "" for formula cells — no cached value in ExcelJS). */
export declare function getCellTextImpl(cell: ExcelJS.Cell): string;
//# sourceMappingURL=style.d.ts.map