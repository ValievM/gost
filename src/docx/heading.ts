import { AlignmentType, HeadingLevel, LevelFormat, Paragraph } from "docx";
import type { DocxStyleConfig, ParagraphOpts, ListType } from "./types";
import { runImpl, paragraphOptions, centeredImpl } from "./paragraph";
import { tagElement } from "../lint";

export function defaultStyles(st: DocxStyleConfig): object {
  return {
    default: { document: { run: { font: st.FONT, size: st.SIZE } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        run: { font: st.FONT, size: st.SIZE, bold: true, color: st.HEADING_COLOR },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        run: { font: st.FONT, size: st.SIZE, bold: true, color: st.HEADING_COLOR },
        paragraph: { spacing: { before: 200, after: 80 } },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        run: { font: st.FONT, size: st.SIZE, bold: true, italics: true, color: st.HEADING_COLOR },
        paragraph: { spacing: { before: 140, after: 60 } },
      },
    ],
  };
}

/** Нумерация для list() — всегда включается в makeDocument */
export function defaultNumbering(st: DocxStyleConfig) {
  const indent = { left: st.INDENT + 360, hanging: st.INDENT };
  return {
    config: [
      {
        reference: "gost-ordered",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.START,
          style: {
            run: { font: st.FONT, size: st.SIZE },
            paragraph: { indent },
          },
        }],
      },
      {
        reference: "gost-bullet",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "–",
          alignment: AlignmentType.START,
          style: {
            run: { font: st.FONT, size: st.SIZE },
            paragraph: { indent },
          },
        }],
      },
    ],
  };
}

export function h1Impl(st: DocxStyleConfig, text: string, opts: ParagraphOpts = {}): Paragraph {
  return tagElement(new Paragraph({
    ...paragraphOptions(st, { ...opts, align: AlignmentType.CENTER, noIndent: true, before: 240, after: 120, keepNext: true }, [
      runImpl(st, text.toUpperCase(), { ...opts, bold: true, color: st.HEADING_COLOR }),
    ]),
    heading: HeadingLevel.HEADING_1,
  }), "h1");
}

export function h2Impl(st: DocxStyleConfig, text: string, opts: ParagraphOpts = {}): Paragraph {
  return tagElement(new Paragraph({
    ...paragraphOptions(st, { ...opts, before: 200, after: 80, keepNext: true }, [
      runImpl(st, text, { ...opts, bold: true, color: st.HEADING_COLOR }),
    ]),
    heading: HeadingLevel.HEADING_2,
  }), "h2");
}

export function h3Impl(st: DocxStyleConfig, text: string, opts: ParagraphOpts = {}): Paragraph {
  return tagElement(new Paragraph({
    ...paragraphOptions(st, { ...opts, before: 140, after: 60, keepNext: true }, [
      runImpl(st, text, { ...opts, bold: true, italics: true, color: st.HEADING_COLOR }),
    ]),
    heading: HeadingLevel.HEADING_3,
  }), "h3");
}

export function listImpl(st: DocxStyleConfig, items: string[], type: ListType, opts: ParagraphOpts = {}): Paragraph[] {
  const ref = type === "ordered" ? "gost-ordered" : "gost-bullet";
  return items.map((text) =>
    tagElement(new Paragraph({
      spacing: { line: opts.line ?? st.LINE, before: 0, after: 0 },
      numbering: { reference: ref, level: 0 },
      children: [runImpl(st, text, opts)],
    }), "listItem")
  );
}

/**
 * Заголовок приложения по ГОСТ 7.32.
 * Возвращает массив параграфов: «ПРИЛОЖЕНИЕ А», опциональный тип и название.
 * @param letter - буква приложения: "А", "Б", ...
 * @param title  - название приложения
 * @param kind   - "(обязательное)" или "(справочное)"
 */
export function appendixImpl(
  st: DocxStyleConfig,
  letter: string,
  title: string,
  kind?: "обязательное" | "справочное",
): Paragraph[] {
  const heading = tagElement(new Paragraph({
    ...paragraphOptions(st, { align: AlignmentType.CENTER, noIndent: true, before: 240, after: 60, keepNext: true }, [
      runImpl(st, `ПРИЛОЖЕНИЕ ${letter.toUpperCase()}`, { bold: true, color: st.HEADING_COLOR }),
    ]),
    heading: HeadingLevel.HEADING_1,
  }), "appendixHeading");

  const result: Paragraph[] = [heading];
  if (kind) {
    result.push(centeredImpl(st, `(${kind})`, { italics: true, before: 0, after: 60 }));
  }
  result.push(centeredImpl(st, title, { bold: true, before: 0, after: 120 }));
  return result;
}
