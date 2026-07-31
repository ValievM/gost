"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMathLike = isMathLike;
exports.toMathComponents = toMathComponents;
exports.mathExpr = mathExpr;
exports.mathFraction = mathFraction;
exports.mathSub = mathSub;
exports.mathSup = mathSup;
exports.mathSubSup = mathSubSup;
exports.mathParen = mathParen;
exports.mathBracket = mathBracket;
exports.mathBrace = mathBrace;
exports.mathRoot = mathRoot;
exports.mathSum = mathSum;
exports.mathIntegral = mathIntegral;
exports.paragraphWithMathImpl = paragraphWithMathImpl;
exports.formulaMathImpl = formulaMathImpl;
exports.formulaInlineImpl = formulaInlineImpl;
const docx_1 = require("docx");
const paragraph_1 = require("./paragraph");
function isMathLike(value) {
    return value instanceof docx_1.Math
        || (typeof value === "object" && value !== null && value.constructor.name.startsWith("Math"));
}
function toMathComponents(value) {
    if (value === undefined || value === null)
        return [];
    if (Array.isArray(value))
        return value.flatMap((item) => toMathComponents(item));
    if (typeof value === "string" || typeof value === "number")
        return [new docx_1.MathRun(String(value))];
    return [value];
}
function mathExpr(...parts) {
    return new docx_1.Math({ children: parts.flatMap((part) => toMathComponents(part)) });
}
function mathFraction(numerator, denominator) {
    return new docx_1.MathFraction({ numerator: toMathComponents(numerator), denominator: toMathComponents(denominator) });
}
function mathSub(base, subScript) {
    return new docx_1.MathSubScript({ children: toMathComponents(base), subScript: toMathComponents(subScript) });
}
function mathSup(base, superScript) {
    return new docx_1.MathSuperScript({ children: toMathComponents(base), superScript: toMathComponents(superScript) });
}
function mathSubSup(base, subScript, superScript) {
    return new docx_1.MathSubSuperScript({
        children: toMathComponents(base),
        subScript: toMathComponents(subScript),
        superScript: toMathComponents(superScript),
    });
}
function mathParen(...parts) {
    return new docx_1.MathRoundBrackets({ children: parts.flatMap((part) => toMathComponents(part)) });
}
function mathBracket(...parts) {
    return new docx_1.MathSquareBrackets({ children: parts.flatMap((part) => toMathComponents(part)) });
}
function mathBrace(...parts) {
    return new docx_1.MathCurlyBrackets({ children: parts.flatMap((part) => toMathComponents(part)) });
}
function mathRoot(content, degree) {
    return new docx_1.MathRadical({ children: toMathComponents(content), degree: degree === undefined ? undefined : toMathComponents(degree) });
}
function mathSum(content, opts = {}) {
    return new docx_1.MathSum({
        children: toMathComponents(content),
        subScript: opts.subScript ? toMathComponents(opts.subScript) : undefined,
        superScript: opts.superScript ? toMathComponents(opts.superScript) : undefined,
    });
}
function mathIntegral(content, opts = {}) {
    return new docx_1.MathIntegral({
        children: toMathComponents(content),
        subScript: opts.subScript ? toMathComponents(opts.subScript) : undefined,
        superScript: opts.superScript ? toMathComponents(opts.superScript) : undefined,
    });
}
function paragraphWithMathImpl(st, parts, opts = {}) {
    const children = parts.map((part) => {
        if (typeof part === "string" || typeof part === "number")
            return (0, paragraph_1.runImpl)(st, part, opts);
        if (part instanceof docx_1.Math)
            return part;
        if (Array.isArray(part) || isMathLike(part))
            return mathExpr(part);
        const desc = part;
        return (0, paragraph_1.runImpl)(st, desc.text, {
            ...opts,
            size: desc.size ?? opts.size,
            bold: desc.bold ?? opts.bold,
            italics: desc.italics ?? opts.italics,
            allCaps: desc.allCaps ?? opts.allCaps,
            underline: desc.underline ?? opts.underline,
            color: desc.color ?? opts.color,
            font: desc.font ?? opts.font,
        });
    });
    return new docx_1.Paragraph((0, paragraph_1.paragraphOptions)(st, opts, children));
}
function formulaMathImpl(st, content, opts = {}) {
    return new docx_1.Paragraph((0, paragraph_1.paragraphOptions)(st, {
        ...opts,
        align: docx_1.AlignmentType.CENTER,
        noIndent: true,
        before: opts.before ?? st.FORMULA_BEFORE,
        after: opts.after ?? st.FORMULA_AFTER,
    }, [mathExpr(content)]));
}
function formulaInlineImpl(st, label, mathContent, opts = {}) {
    return new docx_1.Paragraph((0, paragraph_1.paragraphOptions)(st, opts, [(0, paragraph_1.runImpl)(st, `${label} `, opts), mathExpr(mathContent)]));
}
