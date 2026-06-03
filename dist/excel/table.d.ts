import ExcelJS from "exceljs";
import type { ExcelStyleConfig } from "./types";
/** Applies alternating row fill (zebra striping) to a range, skipping header/result cells. */
export declare function applyZebraStripingImpl(sheet: ExcelJS.Worksheet, startRow: number, endRow: number, startCol: number, endCol: number, headerRows: Set<number> | undefined, st: ExcelStyleConfig): void;
/**
 * Applies borders to a range and header fill to the header row.
 * Skips cells that already have HEADER_FILL or RESULT_FILL (preserves ROW_HEADER_STYLE).
 */
export declare function formatTableRangeImpl(sheet: ExcelJS.Worksheet, startRow: number, endRow: number, startCol: number, endCol: number, headerRow: number, st: ExcelStyleConfig): void;
//# sourceMappingURL=table.d.ts.map