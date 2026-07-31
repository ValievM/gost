"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultStyles = defaultStyles;
exports.defaultNumbering = defaultNumbering;
exports.h1Impl = h1Impl;
exports.h2Impl = h2Impl;
exports.h3Impl = h3Impl;
exports.listImpl = listImpl;
exports.appendixImpl = appendixImpl;
const docx_1 = require("docx");
const paragraph_1 = require("./paragraph");
const lint_1 = require("../lint");
function defaultStyles(st) {
    return {
        default: { document: { run: { font: st.FONT, size: st.SIZE } } },
        paragraphStyles: [
            {
                id: "Heading1",
                name: "Heading 1",
                basedOn: "Normal",
                next: "Normal",
                run: { font: st.FONT, size: st.SIZE, bold: true, color: st.HEADING_COLOR },
                paragraph: { alignment: docx_1.AlignmentType.CENTER, spacing: { before: 240, after: 120 } },
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
function defaultNumbering(st) {
    const indent = { left: st.INDENT + 360, hanging: st.INDENT };
    return {
        config: [
            {
                reference: "gost-ordered",
                levels: [{
                        level: 0,
                        format: docx_1.LevelFormat.DECIMAL,
                        text: "%1.",
                        alignment: docx_1.AlignmentType.START,
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
                        format: docx_1.LevelFormat.BULLET,
                        text: "–",
                        alignment: docx_1.AlignmentType.START,
                        style: {
                            run: { font: st.FONT, size: st.SIZE },
                            paragraph: { indent },
                        },
                    }],
            },
        ],
    };
}
function h1Impl(st, text, opts = {}) {
    return (0, lint_1.tagElement)(new docx_1.Paragraph({
        ...(0, paragraph_1.paragraphOptions)(st, { ...opts, align: docx_1.AlignmentType.CENTER, noIndent: true, before: 240, after: 120, keepNext: true }, [
            (0, paragraph_1.runImpl)(st, text.toUpperCase(), { ...opts, bold: true, color: st.HEADING_COLOR }),
        ]),
        heading: docx_1.HeadingLevel.HEADING_1,
    }), "h1");
}
function h2Impl(st, text, opts = {}) {
    return (0, lint_1.tagElement)(new docx_1.Paragraph({
        ...(0, paragraph_1.paragraphOptions)(st, { ...opts, before: 200, after: 80, keepNext: true }, [
            (0, paragraph_1.runImpl)(st, text, { ...opts, bold: true, color: st.HEADING_COLOR }),
        ]),
        heading: docx_1.HeadingLevel.HEADING_2,
    }), "h2");
}
function h3Impl(st, text, opts = {}) {
    return (0, lint_1.tagElement)(new docx_1.Paragraph({
        ...(0, paragraph_1.paragraphOptions)(st, { ...opts, before: 140, after: 60, keepNext: true }, [
            (0, paragraph_1.runImpl)(st, text, { ...opts, bold: true, italics: true, color: st.HEADING_COLOR }),
        ]),
        heading: docx_1.HeadingLevel.HEADING_3,
    }), "h3");
}
function listImpl(st, items, type, opts = {}) {
    const ref = type === "ordered" ? "gost-ordered" : "gost-bullet";
    return items.map((text) => (0, lint_1.tagElement)(new docx_1.Paragraph({
        spacing: { line: opts.line ?? st.LINE, before: 0, after: 0 },
        numbering: { reference: ref, level: 0 },
        children: [(0, paragraph_1.runImpl)(st, text, opts)],
    }), "listItem"));
}
/**
 * Заголовок приложения по ГОСТ 7.32.
 * Возвращает массив параграфов: «ПРИЛОЖЕНИЕ А», опциональный тип и название.
 * @param letter - буква приложения: "А", "Б", ...
 * @param title  - название приложения
 * @param kind   - "(обязательное)" или "(справочное)"
 */
function appendixImpl(st, letter, title, kind) {
    const heading = (0, lint_1.tagElement)(new docx_1.Paragraph({
        ...(0, paragraph_1.paragraphOptions)(st, { align: docx_1.AlignmentType.CENTER, noIndent: true, before: 240, after: 60, keepNext: true }, [
            (0, paragraph_1.runImpl)(st, `ПРИЛОЖЕНИЕ ${letter.toUpperCase()}`, { bold: true, color: st.HEADING_COLOR }),
        ]),
        heading: docx_1.HeadingLevel.HEADING_1,
    }), "appendixHeading");
    const result = [heading];
    if (kind) {
        result.push((0, paragraph_1.centeredImpl)(st, `(${kind})`, { italics: true, before: 0, after: 60 }));
    }
    result.push((0, paragraph_1.centeredImpl)(st, title, { bold: true, before: 0, after: 120 }));
    return result;
}
//# sourceMappingURL=heading.js.map