import type { ExcelGostOptions, ExcelGostInstance, CellStyleOptions, IAutoFitter } from "./types";
import { createExcelStyle, styleCellImpl, setValueImpl, setFormulaImpl, getCellTextImpl } from "./style";
import { applyZebraStripingImpl, formatTableRangeImpl } from "./table";
import { applyBaseSheetSetupImpl, mergeTitleImpl, setFreezeImpl, addContentsSheetImpl } from "./sheet";
import { addAhpMatrixBlockImpl } from "./ahp";
import { productFormula, absoluteRef, weightedSumFormula, listFormulaRange } from "./formulas";
import { HeuristicAutoFitter } from "./autofit/heuristic";

export * from "./types";
export { createExcelStyle } from "./style";
export { HeuristicAutoFitter } from "./autofit/heuristic";
export { NullAutoFitter } from "./autofit/null";
export { GoogleSheetsAutoFitter } from "./autofit/google-sheets";
export type { GoogleSheetsAutoFitterOptions } from "./autofit/google-sheets";

function resolveAliases(opts: ExcelGostOptions): Partial<import("./types").ExcelStyleConfig> {
    return {
        ...opts,
        FONT_SIZE: opts.FONT_SIZE ?? opts.fontSize,
        FONT_NAME: opts.FONT_NAME ?? opts.fontName,
        HEADER_FILL: opts.HEADER_FILL ?? opts.headerFill,
        RESULT_FILL: opts.RESULT_FILL ?? opts.resultFill,
        TAB_COLOR: opts.TAB_COLOR ?? opts.tabColor,
    };
}

export function createExcelGost(opts: ExcelGostOptions = {}): ExcelGostInstance {
    const st = createExcelStyle(resolveAliases(opts));
    const fitter: IAutoFitter = opts.autoFitter ?? new HeuristicAutoFitter();

    const HEADER_STYLE: CellStyleOptions = { bold: true, border: true, fill: st.HEADER_FILL, color: st.HEADER_COLOR, align: "center" };
    const RESULT_STYLE: CellStyleOptions = { bold: true, border: "medium", fill: st.RESULT_FILL, color: st.RESULT_COLOR, align: "center" };

    return {
        style: st,
        HEADER_STYLE,
        RESULT_STYLE,
        styleCell:           (cell, options = {}) => styleCellImpl(cell, options, st),
        setValue:            (sheet, address, value, options = {}) => setValueImpl(sheet, address, value, options, st),
        setFormula:          (sheet, address, formula, options = {}) => setFormulaImpl(sheet, address, formula, options, st),
        applyBaseSheetSetup: (sheet, widths) => applyBaseSheetSetupImpl(sheet, widths, st),
        mergeTitle:          (sheet, range, text) => mergeTitleImpl(sheet, range, text, st),
        setFreeze:           (sheet, ySplit, activeCell) => setFreezeImpl(sheet, ySplit, activeCell),
        applyZebraStriping:  (sheet, sr, er, sc, ec, hr) => applyZebraStripingImpl(sheet, sr, er, sc, ec, hr, st),
        getCellText:         (cell) => getCellTextImpl(cell),
        autoFitSheet:        (sheet) => fitter.fitSheet(sheet, st),
        autoFitAfterSave:    (outputPath) => fitter.postProcess ? fitter.postProcess(outputPath) : Promise.resolve(),
        formatTableRange:    (sheet, sr, er, sc, ec, hr) => formatTableRangeImpl(sheet, sr, er, sc, ec, hr, st),
        addAhpMatrixBlock:   (sheet, sr, title, labels, matrix, ri) => addAhpMatrixBlockImpl(sheet, sr, title, labels, matrix, ri, st),
        addContentsSheet:    (wb, names) => addContentsSheetImpl(wb, names, st),
        productFormula,
        absoluteRef,
        weightedSumFormula,
        listFormulaRange,
    };
}
