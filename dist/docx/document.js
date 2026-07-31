"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTitlePageImpl = makeTitlePageImpl;
exports.makeContentSectionImpl = makeContentSectionImpl;
exports.makeDocumentImpl = makeDocumentImpl;
exports.saveDocumentImpl = saveDocumentImpl;
exports.diagramBlockImpl = diagramBlockImpl;
const fs_1 = __importDefault(require("fs"));
const docx_1 = require("docx");
const paragraph_1 = require("./paragraph");
const heading_1 = require("./heading");
const image_1 = require("./image");
const plantuml_render_1 = require("../plantuml-render");
const plantuml_size_1 = require("../plantuml-size");
function titleLine(st, content, opts = {}) {
    return (0, paragraph_1.centeredImpl)(st, content, {
        ...opts,
        size: opts.size ?? st.SIZE,
        line: opts.line ?? st.LINE,
        before: opts.before ?? 0,
        after: opts.after ?? 0,
    });
}
function makeFooterCityImpl(st, year) {
    return new docx_1.Footer({ children: [(0, paragraph_1.centeredImpl)(st, `Таганрог ${year}`, { size: st.SIZE })] });
}
function makeFooterPageNumImpl(st) {
    return new docx_1.Footer({
        children: [
            new docx_1.Paragraph({
                alignment: docx_1.AlignmentType.CENTER,
                children: [new docx_1.TextRun({ children: [docx_1.PageNumber.CURRENT], font: st.FONT, size: st.SIZE })],
            }),
        ],
    });
}
function normalizeSubtitle(subtitle) {
    if (Array.isArray(subtitle))
        return subtitle;
    return subtitle === undefined || subtitle === null ? [] : [subtitle];
}
function makeTitlePageImpl(st, opts) {
    const children = [
        titleLine(st, "Министерство науки и высшего образования Российской Федерации", { size: st.SIZE_HEADER }),
        titleLine(st, "Федеральное государственное автономное образовательное", { size: st.SIZE_HEADER }),
        titleLine(st, "учреждение высшего образования", { size: st.SIZE_HEADER }),
        titleLine(st, "«ЮЖНЫЙ ФЕДЕРАЛЬНЫЙ УНИВЕРСИТЕТ»", { size: st.SIZE_HEADER, bold: true }),
        titleLine(st, "Инженерно-технологическая академия", { size: st.SIZE_HEADER }),
        titleLine(st, "Институт компьютерных технологий и информационной безопасности", { size: st.SIZE_HEADER }),
        (0, paragraph_1.blankImpl)(st), (0, paragraph_1.blankImpl)(st), (0, paragraph_1.blankImpl)(st),
        titleLine(st, opts.workType, { size: st.SIZE_TITLE, bold: true }),
        ...normalizeSubtitle(opts.subtitle).map((line) => titleLine(st, line, { size: st.SIZE })),
        titleLine(st, opts.discipline, { size: st.SIZE, after: 120 }),
        (0, paragraph_1.blankImpl)(st), (0, paragraph_1.blankImpl)(st), (0, paragraph_1.blankImpl)(st), (0, paragraph_1.blankImpl)(st), (0, paragraph_1.blankImpl)(st), (0, paragraph_1.blankImpl)(st), (0, paragraph_1.blankImpl)(st), (0, paragraph_1.blankImpl)(st), (0, paragraph_1.blankImpl)(st),
        new docx_1.Paragraph({ spacing: { line: st.LINE }, indent: { left: st.INDENT }, children: [(0, paragraph_1.runImpl)(st, "Выполнил")] }),
        new docx_1.Paragraph({
            spacing: { line: st.LINE },
            tabStops: st.TITLE_TAB_STOPS,
            children: [
                (0, paragraph_1.runImpl)(st, `студент группы ${opts.group}`),
                new docx_1.TextRun({ children: [new docx_1.Tab()], font: st.FONT, size: st.SIZE }),
                (0, paragraph_1.runImpl)(st, "_______________"),
                new docx_1.TextRun({ children: [new docx_1.Tab()], font: st.FONT, size: st.SIZE }),
                (0, paragraph_1.runImpl)(st, opts.author),
            ],
        }),
        (0, paragraph_1.blankImpl)(st),
        new docx_1.Paragraph({ spacing: { line: st.LINE }, indent: { left: st.INDENT }, children: [(0, paragraph_1.runImpl)(st, "Принял")] }),
        new docx_1.Paragraph({
            spacing: { line: st.LINE, after: 560 },
            tabStops: st.TITLE_TAB_STOPS,
            children: [
                (0, paragraph_1.runImpl)(st, opts.teacherTitle ?? "Доцент кафедры"),
                new docx_1.TextRun({ children: [new docx_1.Tab()], font: st.FONT, size: st.SIZE }),
                (0, paragraph_1.runImpl)(st, "_______________"),
                new docx_1.TextRun({ children: [new docx_1.Tab()], font: st.FONT, size: st.SIZE }),
                (0, paragraph_1.runImpl)(st, opts.teacher),
            ],
        }),
    ];
    return { properties: { page: st.PAGE }, footers: { default: makeFooterCityImpl(st, opts.year) }, children };
}
function makeContentSectionImpl(st, children) {
    return { properties: { page: st.PAGE }, footers: { default: makeFooterPageNumImpl(st) }, children };
}
function makeDocumentImpl(st, sections, opts = {}) {
    return new docx_1.Document({
        settings: { updateFields: true },
        styles: opts.styles ?? (0, heading_1.defaultStyles)(st),
        numbering: (0, heading_1.defaultNumbering)(st),
        sections,
    });
}
function saveDocumentImpl(doc, outputPath) {
    return docx_1.Packer.toBuffer(doc).then((buffer) => fs_1.default.promises.writeFile(outputPath, buffer));
}
async function diagramBlockImpl(st, pumlSource, counter, captionText, opts = {}) {
    const dpi = opts.dpi ?? 150;
    // ImageRun использует 96 display px на дюйм. DPI отвечает только за
    // разрешение исходного PNG и не должен увеличивать физический размер в Word.
    const maxWidth = opts.maxWidth ?? Math.round((st.CONTENT_WIDTH / 1440) * 96);
    const renderOpts = { dpi, skinparams: opts.skinparams };
    const png = await (0, plantuml_render_1.renderDiagram)(pumlSource, renderOpts);
    const { width, height } = (0, plantuml_size_1.autoImageSize)(png, maxWidth, dpi, opts.fit ?? "natural");
    if (height > 900) {
        console.warn(`[WARN] Диаграмма "${captionText}" высотой ${height}px — может не влезть на страницу`);
    }
    return [
        (0, image_1.imageBlockImpl)(st, png, width, height),
        counter.caption(captionText),
    ];
}
//# sourceMappingURL=document.js.map