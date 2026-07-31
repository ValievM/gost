"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetsAutoFitter = exports.NullAutoFitter = exports.HeuristicAutoFitter = exports.createExcelStyle = void 0;
exports.createExcelGost = createExcelGost;
const style_1 = require("./style");
const table_1 = require("./table");
const sheet_1 = require("./sheet");
const ahp_1 = require("./ahp");
const formulas_1 = require("./formulas");
const heuristic_1 = require("./autofit/heuristic");
__exportStar(require("./types"), exports);
var style_2 = require("./style");
Object.defineProperty(exports, "createExcelStyle", { enumerable: true, get: function () { return style_2.createExcelStyle; } });
var heuristic_2 = require("./autofit/heuristic");
Object.defineProperty(exports, "HeuristicAutoFitter", { enumerable: true, get: function () { return heuristic_2.HeuristicAutoFitter; } });
var null_1 = require("./autofit/null");
Object.defineProperty(exports, "NullAutoFitter", { enumerable: true, get: function () { return null_1.NullAutoFitter; } });
var google_sheets_1 = require("./autofit/google-sheets");
Object.defineProperty(exports, "GoogleSheetsAutoFitter", { enumerable: true, get: function () { return google_sheets_1.GoogleSheetsAutoFitter; } });
function resolveAliases(opts) {
    return {
        ...opts,
        FONT_SIZE: opts.FONT_SIZE ?? opts.fontSize,
        FONT_NAME: opts.FONT_NAME ?? opts.fontName,
        HEADER_FILL: opts.HEADER_FILL ?? opts.headerFill,
        RESULT_FILL: opts.RESULT_FILL ?? opts.resultFill,
        TAB_COLOR: opts.TAB_COLOR ?? opts.tabColor,
    };
}
function createExcelGost(opts = {}) {
    const st = (0, style_1.createExcelStyle)(resolveAliases(opts));
    const fitter = opts.autoFitter ?? new heuristic_1.HeuristicAutoFitter();
    const HEADER_STYLE = { bold: true, border: true, fill: st.HEADER_FILL, color: st.HEADER_COLOR, align: "center" };
    const RESULT_STYLE = { bold: true, border: "medium", fill: st.RESULT_FILL, color: st.RESULT_COLOR, align: "center" };
    return {
        style: st,
        HEADER_STYLE,
        RESULT_STYLE,
        styleCell: (cell, options = {}) => (0, style_1.styleCellImpl)(cell, options, st),
        setValue: (sheet, address, value, options = {}) => (0, style_1.setValueImpl)(sheet, address, value, options, st),
        setFormula: (sheet, address, formula, options = {}) => (0, style_1.setFormulaImpl)(sheet, address, formula, options, st),
        applyBaseSheetSetup: (sheet, widths) => (0, sheet_1.applyBaseSheetSetupImpl)(sheet, widths, st),
        mergeTitle: (sheet, range, text) => (0, sheet_1.mergeTitleImpl)(sheet, range, text, st),
        setFreeze: (sheet, ySplit, activeCell) => (0, sheet_1.setFreezeImpl)(sheet, ySplit, activeCell),
        applyZebraStriping: (sheet, sr, er, sc, ec, hr) => (0, table_1.applyZebraStripingImpl)(sheet, sr, er, sc, ec, hr, st),
        getCellText: (cell) => (0, style_1.getCellTextImpl)(cell),
        autoFitSheet: (sheet) => fitter.fitSheet(sheet, st),
        autoFitAfterSave: (outputPath) => fitter.postProcess ? fitter.postProcess(outputPath) : Promise.resolve(),
        formatTableRange: (sheet, sr, er, sc, ec, hr) => (0, table_1.formatTableRangeImpl)(sheet, sr, er, sc, ec, hr, st),
        addAhpMatrixBlock: (sheet, sr, title, labels, matrix, ri) => (0, ahp_1.addAhpMatrixBlockImpl)(sheet, sr, title, labels, matrix, ri, st),
        addContentsSheet: (wb, names) => (0, sheet_1.addContentsSheetImpl)(wb, names, st),
        productFormula: formulas_1.productFormula,
        absoluteRef: formulas_1.absoluteRef,
        weightedSumFormula: formulas_1.weightedSumFormula,
        listFormulaRange: formulas_1.listFormulaRange,
    };
}
