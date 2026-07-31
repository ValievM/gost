"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyBaseSheetSetupImpl = applyBaseSheetSetupImpl;
exports.mergeTitleImpl = mergeTitleImpl;
exports.setFreezeImpl = setFreezeImpl;
exports.addContentsSheetImpl = addContentsSheetImpl;
const style_1 = require("./style");
function applyBaseSheetSetupImpl(sheet, widths, st) {
    sheet.properties.defaultRowHeight = st.DEFAULT_ROW_HEIGHT;
    sheet.pageSetup.orientation = st.PAGE_ORIENTATION;
    sheet.pageSetup.fitToPage = st.FIT_TO_PAGE;
    sheet.pageSetup.fitToWidth = st.FIT_TO_WIDTH;
    sheet.pageSetup.fitToHeight = st.FIT_TO_HEIGHT;
    sheet._baseWidths = widths;
    widths.forEach((width, index) => {
        sheet.getColumn(index + 1).width = width;
    });
}
function mergeTitleImpl(sheet, range, text, st) {
    sheet.mergeCells(range);
    const cell = sheet.getCell(range.split(":")[0]);
    cell.value = text;
    (0, style_1.styleCellImpl)(cell, { bold: true, size: st.HEADER_TITLE_SIZE, align: "center" }, st);
}
function setFreezeImpl(sheet, ySplit, activeCell = "A2") {
    sheet.views = [{ state: "frozen", ySplit, activeCell }];
}
function addContentsSheetImpl(workbook, sheetNames, st) {
    const sheet = workbook.addWorksheet("Содержание", { properties: { tabColor: { argb: st.TAB_COLOR } } });
    applyBaseSheetSetupImpl(sheet, [40, 70], st);
    mergeTitleImpl(sheet, "A1:B1", "СОДЕРЖАНИЕ", st);
    (0, style_1.setValueImpl)(sheet, "A3", "Лист", { bold: true, border: true, fill: st.HEADER_FILL, color: st.HEADER_COLOR, align: "center" }, st);
    (0, style_1.setValueImpl)(sheet, "B3", "Переход", { bold: true, border: true, fill: st.HEADER_FILL, color: st.HEADER_COLOR, align: "center" }, st);
    sheetNames.forEach((name, index) => {
        const row = 4 + index;
        (0, style_1.setValueImpl)(sheet, `A${row}`, name, { border: true, align: "left" }, st);
        const link = sheet.getCell(`B${row}`);
        link.value = { text: `Перейти к листу "${name}"`, hyperlink: `#'${name}'!A1` };
        (0, style_1.styleCellImpl)(link, { border: true, align: "left", color: "0563C1" }, st);
    });
    setFreezeImpl(sheet, 3, "A4");
    return sheet;
}
