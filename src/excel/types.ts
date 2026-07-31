import ExcelJS from "exceljs";

export interface ExcelStyleConfig {
    HEADER_FILL: string;
    HEADER_COLOR: string;
    RESULT_FILL: string;
    RESULT_COLOR: string;
    ALT_ROW_FILL: string;
    REGRET_FILL: string;
    FONT_NAME: string;
    FONT_SIZE: number;
    TAB_COLOR: string;
    DEFAULT_ROW_HEIGHT: number;
    PAGE_ORIENTATION: "landscape" | "portrait";
    FIT_TO_PAGE: boolean;
    FIT_TO_WIDTH: number;
    FIT_TO_HEIGHT: number;
    MAX_COLUMN_WIDTH: number;
    MAX_ROW_HEIGHT: number;
    ROW_HEIGHT_FONT_MULTIPLIER: number;
    HEADER_TITLE_SIZE: number;
    BORDER_STYLE: string;
}

/**
 * Strategy interface for auto-fitting column widths and row heights.
 *
 * Built-in implementations:
 *  - HeuristicAutoFitter  — character-length estimation (default)
 *  - NullAutoFitter       — no-op (manual sizing / testing)
 *
 * Planned:
 *  - CanvasAutoFitter     — real glyph metrics via @napi-rs/canvas
 *  - GoogleSheetsAutoFitter — cloud rendering via Google Sheets API
 */
export interface IAutoFitter {
    /** Called per-sheet before saving (sync). No-op for cloud fitters. */
    fitSheet(sheet: ExcelJS.Worksheet, style: ExcelStyleConfig): void;
    /** Called once after the file is saved (async). Used by cloud fitters (Google Sheets, LibreOffice). */
    postProcess?(outputPath: string): Promise<void>;
}

export interface ExcelGostOptions extends Partial<ExcelStyleConfig> {
    /** Pluggable autoFit implementation. Defaults to HeuristicAutoFitter. */
    autoFitter?: IAutoFitter;
    // Convenience aliases
    fontSize?: number;
    fontName?: string;
    headerFill?: string;
    resultFill?: string;
    tabColor?: string;
}

export interface CellStyleOptions {
    fontName?: string;
    size?: number;
    bold?: boolean;
    color?: string;
    align?: "left" | "center" | "right" | "fill" | "justify" | "centerContinuous" | "distributed";
    wrapText?: boolean;
    fill?: string;
    border?: boolean | string;
    numFmt?: string;
}

export interface AhpBlockResult {
    weightColumn: string;
    weightStartRow: number;
    weightEndRow: number;
    osCell: string;
    nextRow: number;
}

export interface ExcelGostInstance {
    readonly style: ExcelStyleConfig;
    readonly HEADER_STYLE: CellStyleOptions;
    readonly RESULT_STYLE: CellStyleOptions;
    styleCell(cell: ExcelJS.Cell, options?: CellStyleOptions): void;
    setValue(sheet: ExcelJS.Worksheet, address: string, value: unknown, options?: CellStyleOptions): ExcelJS.Cell;
    setFormula(sheet: ExcelJS.Worksheet, address: string, formula: string, options?: CellStyleOptions): ExcelJS.Cell;
    applyBaseSheetSetup(sheet: ExcelJS.Worksheet, widths: number[]): void;
    mergeTitle(sheet: ExcelJS.Worksheet, range: string, text: string): void;
    setFreeze(sheet: ExcelJS.Worksheet, ySplit: number, activeCell?: string): void;
    applyZebraStriping(sheet: ExcelJS.Worksheet, startRow: number, endRow: number, startCol: number, endCol: number, headerRows?: Set<number>): void;
    getCellText(cell: ExcelJS.Cell): string;
    autoFitSheet(sheet: ExcelJS.Worksheet): void;
    /** Async post-process after saving — used by cloud fitters (Google Sheets, LibreOffice). No-op for heuristic. */
    autoFitAfterSave(outputPath: string): Promise<void>;
    formatTableRange(sheet: ExcelJS.Worksheet, startRow: number, endRow: number, startCol: number, endCol: number, headerRow: number): void;
    addAhpMatrixBlock(sheet: ExcelJS.Worksheet, startRow: number, title: string, labels: string[], matrix: number[][], randomIndex: number): AhpBlockResult;
    addContentsSheet(workbook: ExcelJS.Workbook, sheetNames: string[]): ExcelJS.Worksheet;
    productFormula(addresses: string[], exponent: number): string;
    absoluteRef(address: string): string;
    weightedSumFormula(valueAddresses: string[], weightAddresses: string[]): string;
    listFormulaRange(sheetName: string, addresses: string[]): string;
}
