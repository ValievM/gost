import ExcelJS from "exceljs";
import type { ExcelStyleConfig, IAutoFitter } from "../types";
/**
 * Estimates column widths and row heights based on character count.
 *
 * Fundamental limitations:
 *  - Character width ≠ pixel width (W ≫ i, Cyrillic > Latin)
 *  - Formula cells have no cached value → not included in width estimation
 *
 * For pixel-accurate sizing, use CanvasAutoFitter or GoogleSheetsAutoFitter.
 */
export declare class HeuristicAutoFitter implements IAutoFitter {
    fitSheet(sheet: ExcelJS.Worksheet, st: ExcelStyleConfig): void;
}
