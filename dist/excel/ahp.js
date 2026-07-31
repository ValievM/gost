"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAhpMatrixBlockImpl = addAhpMatrixBlockImpl;
const style_1 = require("./style");
const formulas_1 = require("./formulas");
function validateInput(labels, matrix) {
    if (!Array.isArray(labels) || labels.length === 0) {
        throw new RangeError("AHP labels must contain at least one item");
    }
    if (!Array.isArray(matrix) || matrix.length !== labels.length) {
        throw new RangeError(`AHP matrix row count must match labels count (${labels.length})`);
    }
    matrix.forEach((row, index) => {
        if (!Array.isArray(row) || row.length !== labels.length) {
            throw new RangeError(`AHP matrix row ${index + 1} length must match labels count (${labels.length})`);
        }
    });
}
function addAhpMatrixBlockImpl(sheet, startRow, title, labels, matrix, randomIndex, st) {
    validateInput(labels, matrix);
    const labelStyle = { bold: true, border: true, fill: st.HEADER_FILL, color: st.HEADER_COLOR, align: "left" };
    (0, style_1.setValueImpl)(sheet, `A${startRow}`, title, { ...labelStyle, size: st.HEADER_TITLE_SIZE }, st);
    sheet.getRow(startRow).height = Math.max(sheet.getRow(startRow).height || st.DEFAULT_ROW_HEIGHT, 34);
    labels.forEach((label, idx) => {
        (0, style_1.setValueImpl)(sheet, `${(0, formulas_1.colLetter)(1 + idx)}${startRow + 2}`, label, { bold: true, border: true, fill: st.HEADER_FILL, color: st.HEADER_COLOR }, st);
        (0, style_1.setValueImpl)(sheet, `A${startRow + 3 + idx}`, label, { bold: true, border: true, fill: st.HEADER_FILL, color: st.HEADER_COLOR }, st);
    });
    (0, style_1.setValueImpl)(sheet, `${(0, formulas_1.colLetter)(1 + labels.length)}${startRow + 2}`, "G_i", { bold: true, border: true, fill: st.HEADER_FILL, color: st.HEADER_COLOR }, st);
    (0, style_1.setValueImpl)(sheet, `${(0, formulas_1.colLetter)(2 + labels.length)}${startRow + 2}`, "w_i", { bold: true, border: true, fill: st.HEADER_FILL, color: st.HEADER_COLOR }, st);
    for (let r = 0; r < labels.length; r += 1) {
        const row = startRow + 3 + r;
        const cells = [];
        for (let c = 0; c < labels.length; c += 1) {
            const address = `${(0, formulas_1.colLetter)(1 + c)}${row}`;
            cells.push(address);
            (0, style_1.setValueImpl)(sheet, address, matrix[r][c], { border: true, numFmt: "0.0000" }, st);
        }
        const gCol = (0, formulas_1.colLetter)(1 + labels.length);
        const wCol = (0, formulas_1.colLetter)(2 + labels.length);
        (0, style_1.setFormulaImpl)(sheet, `${gCol}${row}`, (0, formulas_1.productFormula)(cells, labels.length), { border: true, numFmt: "0.0000" }, st);
        (0, style_1.setFormulaImpl)(sheet, `${wCol}${row}`, `${gCol}${row}/SUM(${gCol}${startRow + 3}:${gCol}${startRow + 2 + labels.length})`, { border: true, numFmt: "0.0000" }, st);
    }
    const statsRow = startRow + 4 + labels.length;
    const weightsCol = (0, formulas_1.colLetter)(2 + labels.length);
    (0, style_1.setValueImpl)(sheet, `A${statsRow}`, "Сумма весов:", labelStyle, st);
    (0, style_1.setFormulaImpl)(sheet, `B${statsRow}`, `SUM(${weightsCol}${startRow + 3}:${weightsCol}${startRow + 2 + labels.length})`, { border: true, numFmt: "0.0000" }, st);
    const colSumsRow = statsRow + 2;
    (0, style_1.setValueImpl)(sheet, `A${colSumsRow}`, "Суммы столбцов:", labelStyle, st);
    for (let c = 0; c < labels.length; c += 1) {
        const letter = (0, formulas_1.colLetter)(1 + c);
        (0, style_1.setFormulaImpl)(sheet, `${letter}${colSumsRow}`, `SUM(${letter}${startRow + 3}:${letter}${startRow + 2 + labels.length})`, { border: true, numFmt: "0.0000" }, st);
    }
    const colSumAddresses = labels.map((_, i) => `${(0, formulas_1.colLetter)(1 + i)}${colSumsRow}`);
    const weightAddresses = labels.map((_, i) => `${weightsCol}${startRow + 3 + i}`);
    (0, style_1.setValueImpl)(sheet, `A${colSumsRow + 1}`, "λ_max =", labelStyle, st);
    (0, style_1.setFormulaImpl)(sheet, `B${colSumsRow + 1}`, (0, formulas_1.weightedSumFormula)(colSumAddresses, weightAddresses), { border: true, numFmt: "0.0000" }, st);
    (0, style_1.setValueImpl)(sheet, `A${colSumsRow + 2}`, "ИС =", labelStyle, st);
    (0, style_1.setFormulaImpl)(sheet, `B${colSumsRow + 2}`, `(B${colSumsRow + 1}-${labels.length})/${labels.length - 1}`, { border: true, numFmt: "0.0000" }, st);
    (0, style_1.setValueImpl)(sheet, `A${colSumsRow + 3}`, `ИС_сл (n=${labels.length}) =`, labelStyle, st);
    (0, style_1.setValueImpl)(sheet, `B${colSumsRow + 3}`, randomIndex, { border: true, numFmt: "0.00" }, st);
    (0, style_1.setValueImpl)(sheet, `A${colSumsRow + 4}`, "ОС =", labelStyle, st);
    (0, style_1.setFormulaImpl)(sheet, `B${colSumsRow + 4}`, `B${colSumsRow + 2}/B${colSumsRow + 3}`, { border: true, numFmt: "0.0000" }, st);
    (0, style_1.setValueImpl)(sheet, `A${colSumsRow + 5}`, "ОС% =", labelStyle, st);
    (0, style_1.setFormulaImpl)(sheet, `B${colSumsRow + 5}`, `B${colSumsRow + 4}*100`, { border: true, numFmt: "0.00" }, st);
    return {
        weightColumn: weightsCol,
        weightStartRow: startRow + 3,
        weightEndRow: startRow + 2 + labels.length,
        osCell: `B${colSumsRow + 4}`,
        nextRow: colSumsRow + 7,
    };
}
