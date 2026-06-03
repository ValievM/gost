import type { ExcelGostOptions, ExcelGostInstance } from "./types";
export * from "./types";
export { createExcelStyle } from "./style";
export { HeuristicAutoFitter } from "./autofit/heuristic";
export { NullAutoFitter } from "./autofit/null";
export { GoogleSheetsAutoFitter } from "./autofit/google-sheets";
export type { GoogleSheetsAutoFitterOptions } from "./autofit/google-sheets";
export declare function createExcelGost(opts?: ExcelGostOptions): ExcelGostInstance;
//# sourceMappingURL=index.d.ts.map