"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DOCX_STYLE = void 0;
exports.createDocxStyle = createDocxStyle;
const docx_1 = require("docx");
exports.DEFAULT_DOCX_STYLE = {
    FONT: "Times New Roman",
    SIZE: 28,
    SIZE_TITLE: 32,
    SIZE_HEADER: 24,
    SIZE_CODE: 24,
    INDENT: 709,
    LINE: 360,
    CONTENT_WIDTH: 9355,
    CODE_FONT: "Courier New",
    TABLE_CELL_LINE: 276,
    TABLE_CELL_MARGINS: { top: 30, bottom: 30, left: 60, right: 60 },
    HEADING_COLOR: "000000",
    CAPTION_BEFORE: 60,
    CAPTION_AFTER: 60,
    TABLE_CAPTION_BEFORE: 120,
    TABLE_CAPTION_AFTER: 60,
    IMAGE_BEFORE: 120,
    IMAGE_AFTER: 60,
    FORMULA_BEFORE: 80,
    FORMULA_AFTER: 80,
    PAGE: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1134, bottom: 1134, left: 1701, right: 850 },
    },
    BORDER_SINGLE: { style: docx_1.BorderStyle.SINGLE, size: 1, color: "000000" },
    BORDERS_ALL: {
        top: { style: docx_1.BorderStyle.SINGLE, size: 1, color: "000000" },
        bottom: { style: docx_1.BorderStyle.SINGLE, size: 1, color: "000000" },
        left: { style: docx_1.BorderStyle.SINGLE, size: 1, color: "000000" },
        right: { style: docx_1.BorderStyle.SINGLE, size: 1, color: "000000" },
    },
    TITLE_TAB_STOPS: [
        { type: docx_1.TabStopType.LEFT, position: 4500 },
        { type: docx_1.TabStopType.RIGHT, position: 9355 },
    ],
};
function cloneBorder(border) {
    return { ...border };
}
function cloneBorders(borders) {
    return {
        top: cloneBorder(borders.top),
        bottom: cloneBorder(borders.bottom),
        left: cloneBorder(borders.left),
        right: cloneBorder(borders.right),
    };
}
function createDocxStyle(opts = {}) {
    const borderSingle = cloneBorder(opts.BORDER_SINGLE ?? exports.DEFAULT_DOCX_STYLE.BORDER_SINGLE);
    const bordersAll = opts.BORDERS_ALL
        ? cloneBorders(opts.BORDERS_ALL)
        : {
            top: cloneBorder(borderSingle),
            bottom: cloneBorder(borderSingle),
            left: cloneBorder(borderSingle),
            right: cloneBorder(borderSingle),
        };
    return {
        ...exports.DEFAULT_DOCX_STYLE,
        ...opts,
        FONT: opts.font ?? opts.FONT ?? exports.DEFAULT_DOCX_STYLE.FONT,
        SIZE: opts.size ?? opts.SIZE ?? exports.DEFAULT_DOCX_STYLE.SIZE,
        SIZE_TITLE: opts.sizeTitle ?? opts.SIZE_TITLE ?? exports.DEFAULT_DOCX_STYLE.SIZE_TITLE,
        SIZE_HEADER: opts.sizeHeader ?? opts.SIZE_HEADER ?? exports.DEFAULT_DOCX_STYLE.SIZE_HEADER,
        SIZE_CODE: opts.sizeCode ?? opts.SIZE_CODE ?? exports.DEFAULT_DOCX_STYLE.SIZE_CODE,
        INDENT: opts.indent ?? opts.INDENT ?? exports.DEFAULT_DOCX_STYLE.INDENT,
        LINE: opts.line ?? opts.LINE ?? exports.DEFAULT_DOCX_STYLE.LINE,
        CONTENT_WIDTH: opts.contentWidth ?? opts.CONTENT_WIDTH ?? exports.DEFAULT_DOCX_STYLE.CONTENT_WIDTH,
        CODE_FONT: opts.codeFont ?? opts.CODE_FONT ?? exports.DEFAULT_DOCX_STYLE.CODE_FONT,
        TABLE_CELL_MARGINS: {
            ...exports.DEFAULT_DOCX_STYLE.TABLE_CELL_MARGINS,
            ...(opts.TABLE_CELL_MARGINS ?? {}),
        },
        PAGE: {
            size: { ...exports.DEFAULT_DOCX_STYLE.PAGE.size, ...(opts.page?.size ?? opts.PAGE?.size ?? {}) },
            margin: { ...exports.DEFAULT_DOCX_STYLE.PAGE.margin, ...(opts.page?.margin ?? opts.PAGE?.margin ?? {}) },
        },
        BORDER_SINGLE: borderSingle,
        BORDERS_ALL: bordersAll,
        TITLE_TAB_STOPS: (opts.TITLE_TAB_STOPS ?? exports.DEFAULT_DOCX_STYLE.TITLE_TAB_STOPS)
            .map((stop) => ({ ...stop })),
    };
}
//# sourceMappingURL=style.js.map