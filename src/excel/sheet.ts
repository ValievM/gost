import ExcelJS from "exceljs";
import type { ExcelStyleConfig } from "./types";
import { styleCellImpl, setValueImpl } from "./style";

export function applyBaseSheetSetupImpl(sheet: ExcelJS.Worksheet, widths: number[], st: ExcelStyleConfig): void {
    sheet.properties.defaultRowHeight = st.DEFAULT_ROW_HEIGHT;
    sheet.pageSetup.orientation = st.PAGE_ORIENTATION;
    sheet.pageSetup.fitToPage = st.FIT_TO_PAGE;
    sheet.pageSetup.fitToWidth = st.FIT_TO_WIDTH;
    sheet.pageSetup.fitToHeight = st.FIT_TO_HEIGHT;
    (sheet as ExcelJS.Worksheet & { _baseWidths?: number[] })._baseWidths = widths;
    widths.forEach((width, index) => {
        sheet.getColumn(index + 1).width = width;
    });
}

export function mergeTitleImpl(sheet: ExcelJS.Worksheet, range: string, text: string, st: ExcelStyleConfig): void {
    sheet.mergeCells(range);
    const cell = sheet.getCell(range.split(":")[0]);
    cell.value = text;
    styleCellImpl(cell, { bold: true, size: st.HEADER_TITLE_SIZE, align: "center" }, st);
}

export function setFreezeImpl(sheet: ExcelJS.Worksheet, ySplit: number, activeCell = "A2"): void {
    sheet.views = [{ state: "frozen", ySplit, activeCell }];
}

export function addContentsSheetImpl(
    workbook: ExcelJS.Workbook,
    sheetNames: string[],
    st: ExcelStyleConfig,
): ExcelJS.Worksheet {
    const sheet = workbook.addWorksheet("Содержание", { properties: { tabColor: { argb: st.TAB_COLOR } } });
    applyBaseSheetSetupImpl(sheet, [40, 70], st);
    mergeTitleImpl(sheet, "A1:B1", "СОДЕРЖАНИЕ", st);
    setValueImpl(sheet, "A3", "Лист", { bold: true, border: true, fill: st.HEADER_FILL, color: st.HEADER_COLOR, align: "center" }, st);
    setValueImpl(sheet, "B3", "Переход", { bold: true, border: true, fill: st.HEADER_FILL, color: st.HEADER_COLOR, align: "center" }, st);
    sheetNames.forEach((name, index) => {
        const row = 4 + index;
        setValueImpl(sheet, `A${row}`, name, { border: true, align: "left" }, st);
        const link = sheet.getCell(`B${row}`);
        link.value = { text: `Перейти к листу "${name}"`, hyperlink: `#'${name}'!A1` };
        styleCellImpl(link, { border: true, align: "left", color: "0563C1" }, st);
    });
    setFreezeImpl(sheet, 3, "A4");
    return sheet;
}
