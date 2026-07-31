import fs from "fs";
import { AlignmentType, Document, Footer, Paragraph, Packer, Tab, Table, TextRun, PageNumber } from "docx";
import type { DocxStyleConfig, TitlePageOpts, DocxSection, CaptionCounter, DiagramBlockOpts } from "./types";
import { runImpl, blankImpl, centeredImpl } from "./paragraph";
import { defaultStyles, defaultNumbering } from "./heading";
import { imageBlockImpl } from "./image";
import { renderDiagram, RenderDiagramOpts, SkinparamOpts } from "../plantuml-render";
import { autoImageSize } from "../plantuml-size";

function titleLine(st: DocxStyleConfig, content: string | number, opts: import("./types").ParagraphOpts = {}): Paragraph {
  return centeredImpl(st, content, {
    ...opts,
    size: opts.size ?? st.SIZE,
    line: opts.line ?? st.LINE,
    before: opts.before ?? 0,
    after: opts.after ?? 0,
  });
}

function makeFooterCityImpl(st: DocxStyleConfig, year: string | number): Footer {
  return new Footer({ children: [centeredImpl(st, `Таганрог ${year}`, { size: st.SIZE })] });
}

function makeFooterPageNumImpl(st: DocxStyleConfig): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], font: st.FONT, size: st.SIZE })],
      }),
    ],
  });
}

function normalizeSubtitle(subtitle: string | string[] | undefined): string[] {
  if (Array.isArray(subtitle)) return subtitle;
  return subtitle === undefined || subtitle === null ? [] : [subtitle];
}

export function makeTitlePageImpl(st: DocxStyleConfig, opts: TitlePageOpts): DocxSection {
  const children: Paragraph[] = [
    titleLine(st, "Министерство науки и высшего образования Российской Федерации", { size: st.SIZE_HEADER }),
    titleLine(st, "Федеральное государственное автономное образовательное", { size: st.SIZE_HEADER }),
    titleLine(st, "учреждение высшего образования", { size: st.SIZE_HEADER }),
    titleLine(st, "«ЮЖНЫЙ ФЕДЕРАЛЬНЫЙ УНИВЕРСИТЕТ»", { size: st.SIZE_HEADER, bold: true }),
    titleLine(st, "Инженерно-технологическая академия", { size: st.SIZE_HEADER }),
    titleLine(st, "Институт компьютерных технологий и информационной безопасности", { size: st.SIZE_HEADER }),
    blankImpl(st), blankImpl(st), blankImpl(st),
    titleLine(st, opts.workType, { size: st.SIZE_TITLE, bold: true }),
    ...normalizeSubtitle(opts.subtitle).map((line) => titleLine(st, line, { size: st.SIZE })),
    titleLine(st, opts.discipline, { size: st.SIZE, after: 120 }),
    blankImpl(st), blankImpl(st), blankImpl(st), blankImpl(st), blankImpl(st), blankImpl(st), blankImpl(st), blankImpl(st), blankImpl(st),
    new Paragraph({ spacing: { line: st.LINE }, indent: { left: st.INDENT }, children: [runImpl(st, "Выполнил")] }),
    new Paragraph({
      spacing: { line: st.LINE },
      tabStops: st.TITLE_TAB_STOPS,
      children: [
        runImpl(st, `студент группы ${opts.group}`),
        new TextRun({ children: [new Tab()], font: st.FONT, size: st.SIZE }),
        runImpl(st, "_______________"),
        new TextRun({ children: [new Tab()], font: st.FONT, size: st.SIZE }),
        runImpl(st, opts.author),
      ],
    }),
    blankImpl(st),
    new Paragraph({ spacing: { line: st.LINE }, indent: { left: st.INDENT }, children: [runImpl(st, "Принял")] }),
    new Paragraph({
      spacing: { line: st.LINE, after: 560 },
      tabStops: st.TITLE_TAB_STOPS,
      children: [
        runImpl(st, opts.teacherTitle ?? "Доцент кафедры"),
        new TextRun({ children: [new Tab()], font: st.FONT, size: st.SIZE }),
        runImpl(st, "_______________"),
        new TextRun({ children: [new Tab()], font: st.FONT, size: st.SIZE }),
        runImpl(st, opts.teacher),
      ],
    }),
  ];
  return { properties: { page: st.PAGE }, footers: { default: makeFooterCityImpl(st, opts.year) }, children };
}

export function makeContentSectionImpl(st: DocxStyleConfig, children: Array<Paragraph | Table>): DocxSection {
  return { properties: { page: st.PAGE }, footers: { default: makeFooterPageNumImpl(st) }, children };
}

export function makeDocumentImpl(st: DocxStyleConfig, sections: DocxSection[], opts: { styles?: object } = {}): Document {
  return new Document({
    settings: { updateFields: true },
    styles: opts.styles ?? defaultStyles(st),
    numbering: defaultNumbering(st),
    sections,
  } as ConstructorParameters<typeof Document>[0]);
}

export function saveDocumentImpl(doc: Document, outputPath: string): Promise<void> {
  return Packer.toBuffer(doc).then((buffer) => fs.promises.writeFile(outputPath, buffer));
}

export async function diagramBlockImpl(
  st: DocxStyleConfig,
  pumlSource: string,
  counter: CaptionCounter,
  captionText: string,
  opts: DiagramBlockOpts = {}
): Promise<Paragraph[]> {
  const dpi = opts.dpi ?? 150;
  // ImageRun использует 96 display px на дюйм. DPI отвечает только за
  // разрешение исходного PNG и не должен увеличивать физический размер в Word.
  const maxWidth = opts.maxWidth ?? Math.round((st.CONTENT_WIDTH / 1440) * 96);
  const renderOpts: RenderDiagramOpts & SkinparamOpts = { dpi, skinparams: opts.skinparams };
  const png = await renderDiagram(pumlSource, renderOpts);
  const { width, height } = autoImageSize(png, maxWidth, dpi, opts.fit ?? "natural");
  if (height > 900) {
    console.warn(`[WARN] Диаграмма "${captionText}" высотой ${height}px — может не влезть на страницу`);
  }
  return [
    imageBlockImpl(st, png, width, height),
    counter.caption(captionText),
  ];
}
