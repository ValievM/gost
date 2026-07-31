"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runImpl = runImpl;
exports.paragraphOptions = paragraphOptions;
exports.paragraphChildren = paragraphChildren;
exports.paragraphImpl = paragraphImpl;
exports.centeredImpl = centeredImpl;
exports.blankImpl = blankImpl;
exports.pageBreakImpl = pageBreakImpl;
exports.placeholderImpl = placeholderImpl;
const docx_1 = require("docx");
const lint_1 = require("../lint");
function runImpl(st, text, opts = {}) {
    return new docx_1.TextRun({
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
function paragraphOptions(st, opts = {}, children = []) {
    return {
        heading: undefined,
        alignment: opts.align || docx_1.AlignmentType.JUSTIFIED,
        spacing: { line: opts.line ?? st.LINE, before: opts.before ?? 0, after: opts.after ?? 0 },
        indent: opts.noIndent ? undefined : { firstLine: opts.indent ?? st.INDENT },
        keepNext: !!opts.keepNext,
        keepLines: opts.keepLines !== undefined ? opts.keepLines : true,
        children,
    };
}
function paragraphChildren(st, content, opts = {}) {
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
function paragraphImpl(st, content, opts = {}) {
    return (0, lint_1.tagElement)(new docx_1.Paragraph(paragraphOptions(st, opts, paragraphChildren(st, content, opts))), "paragraph");
}
function centeredImpl(st, content, opts = {}) {
    return (0, lint_1.tagElement)(paragraphImpl(st, content, { ...opts, align: docx_1.AlignmentType.CENTER, noIndent: true }), "centered");
}
function blankImpl(st, opts = {}) {
    return (0, lint_1.tagElement)(new docx_1.Paragraph({ spacing: { line: opts.line ?? st.LINE }, children: [runImpl(st, "", opts)] }), "blank");
}
function pageBreakImpl() {
    return (0, lint_1.tagElement)(new docx_1.Paragraph({ children: [new docx_1.PageBreak()] }), "pageBreak");
}
function placeholderImpl(st, label, opts = {}) {
    const border = { style: docx_1.BorderStyle.SINGLE, size: 4, color: "AAAAAA" };
    return (0, lint_1.tagElement)(new docx_1.Paragraph({
        ...paragraphOptions(st, {
            ...opts,
            align: docx_1.AlignmentType.CENTER,
            noIndent: true,
            before: opts.before ?? 120,
            after: opts.after ?? 60,
        }, [runImpl(st, label, { ...opts, italics: true, color: opts.color ?? "888888" })]),
        border: { top: border, bottom: border, left: border, right: border },
    }), "placeholder");
}
//# sourceMappingURL=paragraph.js.map