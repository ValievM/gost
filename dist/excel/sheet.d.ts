import ExcelJS from "exceljs";
import type { ExcelStyleConfig } from "./types";
export declare function applyBaseSheetSetupImpl(sheet: ExcelJS.Worksheet, widths: number[], st: ExcelStyleConfig): void;
export declare function mergeTitleImpl(sheet: ExcelJS.Worksheet, range: string, text: string, st: ExcelStyleConfig): void;
export declare function setFreezeImpl(sheet: ExcelJS.Worksheet, ySplit: number, activeCell?: string): void;
export declare function addContentsSheetImpl(workbook: ExcelJS.Workbook, sheetNames: string[], st: ExcelStyleConfig): ExcelJS.Worksheet;
