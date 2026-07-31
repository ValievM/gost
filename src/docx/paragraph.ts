import { AlignmentType, BorderStyle, Paragraph, PageBreak, TextRun } from "docx";
import type { DocxStyleConfig, ParagraphOpts, ParagraphChild, Content, RunDescriptor } from "./types";
import { tagElement } from "../lint";

export function runImpl(st: DocxStyleConfig, text: string | number, opts: ParagraphOpts = {}): TextRun {
  return new TextRun({
    text: String(text ?? ""),
    font: opts.font ?? st.FONT,
    size: opts.size ?? st.SIZE,
    bold: !!opts.bold,
    italics: !!opts.italics,
    allCaps: !!opts.allCaps,
    underline: opts.underline ? (opts.underline === true ? {} : opts.underline) : undefined,
    color: opts.color,
  });
}

export function paragraphOptions(st: DocxStyleConfig, opts: ParagraphOpts = {}, children: ParagraphChild[] = []) {
  return {
    heading: undefined,
    alignment: (opts.align as (typeof AlignmentType)[keyof typeof AlignmentType]) || AlignmentType.JUSTIFIED,
    spacing: { line: opts.line ?? st.LINE, before: opts.before ?? 0, after: opts.after ?? 0 },
    indent: opts.noIndent ? undefined : { firstLine: opts.indent ?? st.INDENT },
    keepNext: !!opts.keepNext,
    keepLines: opts.keepLines !== undefined ? opts.keepLines : true,
    children,
  };
}

export function paragraphChildren(st: DocxStyleConfig, content: Content, opts: ParagraphOpts = {}): TextRun[] {
  if (typeof content === "string" || typeof content === "number") {
    return [runImpl(st, content, opts)];
  }
  return content.map((item) => {
    if (typeof item === "string" || typeof item === "number") {
      return runImpl(st, item, opts);
    }
    return runImpl(st, item.text, {
      ...opts,
      size: item.size ?? opts.size,
      bold: item.bold ?? opts.bold,
      italics: item.italics ?? opts.italics,
      allCaps: item.allCaps ?? opts.allCaps,
      underline: item.underline ?? opts.underline,
      color: item.color ?? opts.color,
      font: item.font ?? opts.font,
    });
  });
}

export function paragraphImpl(st: DocxStyleConfig, content: Content, opts: ParagraphOpts = {}): Paragraph {
  return tagElement(new Paragraph(paragraphOptions(st, opts, paragraphChildren(st, content, opts))), "paragraph");
}

export function centeredImpl(st: DocxStyleConfig, content: Content, opts: ParagraphOpts = {}): Paragraph {
  return tagElement(paragraphImpl(st, content, { ...opts, align: AlignmentType.CENTER, noIndent: true }), "centered");
}

export function blankImpl(st: DocxStyleConfig, opts: ParagraphOpts = {}): Paragraph {
  return tagElement(new Paragraph({ spacing: { line: opts.line ?? st.LINE }, children: [runImpl(st, "", opts)] }), "blank");
}

export function pageBreakImpl(): Paragraph {
  return tagElement(new Paragraph({ children: [new PageBreak()] }), "pageBreak");
}

export function placeholderImpl(st: DocxStyleConfig, label: string, opts: ParagraphOpts = {}): Paragraph {
  const border = { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA" };
  return tagElement(new Paragraph({
    ...paragraphOptions(st, {
      ...opts,
      align: AlignmentType.CENTER,
      noIndent: true,
      before: opts.before ?? 120,
      after: opts.after ?? 60,
    }, [runImpl(st, label, { ...opts, italics: true, color: opts.color ?? "888888" })]),
    border: { top: border, bottom: border, left: border, right: border },
  }), "placeholder");
}
