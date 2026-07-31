import { BorderStyle, TabStopType } from "docx";
import type { DocxStyleConfig, DocxGostOptions } from "./types";

export const DEFAULT_DOCX_STYLE: DocxStyleConfig = {
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
  BORDER_SINGLE: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  BORDERS_ALL: {
    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  },
  TITLE_TAB_STOPS: [
    { type: TabStopType.LEFT, position: 4500 },
    { type: TabStopType.RIGHT, position: 9355 },
  ],
};

function cloneBorder(border: DocxStyleConfig["BORDER_SINGLE"]): DocxStyleConfig["BORDER_SINGLE"] {
  return { ...border };
}

function cloneBorders(borders: DocxStyleConfig["BORDERS_ALL"]): DocxStyleConfig["BORDERS_ALL"] {
  return {
    top: cloneBorder(borders.top),
    bottom: cloneBorder(borders.bottom),
    left: cloneBorder(borders.left),
    right: cloneBorder(borders.right),
  };
}

export function createDocxStyle(opts: DocxGostOptions["style"] = {}): DocxStyleConfig {
  const borderSingle = cloneBorder(opts.BORDER_SINGLE ?? DEFAULT_DOCX_STYLE.BORDER_SINGLE);
  const bordersAll = opts.BORDERS_ALL
    ? cloneBorders(opts.BORDERS_ALL)
    : {
      top: cloneBorder(borderSingle),
      bottom: cloneBorder(borderSingle),
      left: cloneBorder(borderSingle),
      right: cloneBorder(borderSingle),
    };

  return {
    ...DEFAULT_DOCX_STYLE,
    ...opts,
    FONT: opts.font ?? opts.FONT ?? DEFAULT_DOCX_STYLE.FONT,
    SIZE: opts.size ?? opts.SIZE ?? DEFAULT_DOCX_STYLE.SIZE,
    SIZE_TITLE: opts.sizeTitle ?? opts.SIZE_TITLE ?? DEFAULT_DOCX_STYLE.SIZE_TITLE,
    SIZE_HEADER: opts.sizeHeader ?? opts.SIZE_HEADER ?? DEFAULT_DOCX_STYLE.SIZE_HEADER,
    SIZE_CODE: opts.sizeCode ?? opts.SIZE_CODE ?? DEFAULT_DOCX_STYLE.SIZE_CODE,
    INDENT: opts.indent ?? opts.INDENT ?? DEFAULT_DOCX_STYLE.INDENT,
    LINE: opts.line ?? opts.LINE ?? DEFAULT_DOCX_STYLE.LINE,
    CONTENT_WIDTH: opts.contentWidth ?? opts.CONTENT_WIDTH ?? DEFAULT_DOCX_STYLE.CONTENT_WIDTH,
    CODE_FONT: opts.codeFont ?? opts.CODE_FONT ?? DEFAULT_DOCX_STYLE.CODE_FONT,
    TABLE_CELL_MARGINS: {
      ...DEFAULT_DOCX_STYLE.TABLE_CELL_MARGINS,
      ...(opts.TABLE_CELL_MARGINS ?? {}),
    },
    PAGE: {
      size: { ...DEFAULT_DOCX_STYLE.PAGE.size, ...(opts.page?.size ?? opts.PAGE?.size ?? {}) },
      margin: { ...DEFAULT_DOCX_STYLE.PAGE.margin, ...(opts.page?.margin ?? opts.PAGE?.margin ?? {}) },
    },
    BORDER_SINGLE: borderSingle,
    BORDERS_ALL: bordersAll,
    TITLE_TAB_STOPS: (opts.TITLE_TAB_STOPS ?? DEFAULT_DOCX_STYLE.TITLE_TAB_STOPS)
      .map((stop) => ({ ...stop })),
  };
}
