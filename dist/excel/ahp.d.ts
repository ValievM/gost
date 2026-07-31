import ExcelJS from "exceljs";
import type { ExcelStyleConfig, AhpBlockResult } from "./types";
export declare function addAhpMatrixBlockImpl(sheet: ExcelJS.Worksheet, startRow: number, title: string, labels: string[], matrix: number[][], randomIndex: number, st: ExcelStyleConfig): AhpBlockResult;
