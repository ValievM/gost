"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printLintResults = exports.lintChildren = exports.TableOfContents = void 0;
exports.createDocxGost = createDocxGost;
const docx_1 = require("docx");
Object.defineProperty(exports, "TableOfContents", { enumerable: true, get: function () { return docx_1.TableOfContents; } });
const style_1 = require("./style");
const paragraph_1 = require("./paragraph");
const math_1 = require("./math");
const heading_1 = require("./heading");
const caption_1 = require("./caption");
const image_1 = require("./image");
const code_1 = require("./code");
const table_1 = require("./table");
const document_1 = require("./document");
const lint_1 = require("../lint");
__exportStar(require("./types"), exports);
__exportStar(require("./style"), exports);
__exportStar(require("./math"), exports);
var lint_2 = require("../lint");
Object.defineProperty(exports, "lintChildren", { enumerable: true, get: function () { return lint_2.lintChildren; } });
Object.defineProperty(exports, "printLintResults", { enumerable: true, get: function () { return lint_2.printLintResults; } });
function createDocxGost(factoryOpts = {}) {
    const st = (0, style_1.createDocxStyle)(factoryOpts.style);
    return {
        style: st,
        run: (text, opts = {}) => (0, paragraph_1.runImpl)(st, text, opts),
        paragraph: (content, opts = {}) => (0, paragraph_1.paragraphImpl)(st, content, opts),
        centered: (content, opts = {}) => (0, paragraph_1.centeredImpl)(st, content, opts),
        paragraphWithMath: (parts, opts = {}) => (0, math_1.paragraphWithMathImpl)(st, parts, opts),
        h1: (text, opts = {}) => (0, heading_1.h1Impl)(st, text, opts),
        h2: (text, opts = {}) => (0, heading_1.h2Impl)(st, text, opts),
        h3: (text, opts = {}) => (0, heading_1.h3Impl)(st, text, opts),
        blank: (opts = {}) => (0, paragraph_1.blankImpl)(st, opts),
        pageBreak: () => (0, paragraph_1.pageBreakImpl)(),
        caption: (text, opts = {}) => (0, caption_1.captionImpl)(st, text, opts),
        tableCaption: (text, opts = {}) => (0, caption_1.tableCaptionImpl)(st, text, opts),
        createCaptionCounter: (prefix, opts = {}) => (0, caption_1.createCaptionCounterImpl)(st, prefix, opts),
        placeholder: (label, opts = {}) => (0, paragraph_1.placeholderImpl)(st, label, opts),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        imageBlock: (src, wOrOpts, h, opts) => (0, image_1.imageBlockImpl)(st, src, wOrOpts, h, opts ?? {}),
        codeLine: (text, opts = {}) => (0, code_1.codeLineImpl)(st, text, opts),
        codeBlock: (lines, opts = {}) => lines.map((line) => (0, code_1.codeLineImpl)(st, line, opts)),
        codeFile: (filePath, opts = {}) => (0, code_1.codeFileImpl)(st, filePath, opts),
        list: (items, type = "bullet", opts = {}) => (0, heading_1.listImpl)(st, items, type, opts),
        appendix: (letter, title, kind) => (0, heading_1.appendixImpl)(st, letter, title, kind),
        formulaMath: (content, opts = {}) => (0, math_1.formulaMathImpl)(st, content, opts),
        formulaInline: (label, math, opts = {}) => (0, math_1.formulaInlineImpl)(st, label, math, opts),
        makeTable: (rows, opts = {}) => (0, table_1.makeTableImpl)(st, rows, opts),
        makeTitlePage: (opts) => (0, document_1.makeTitlePageImpl)(st, opts),
        makeContentSection: (children) => (0, document_1.makeContentSectionImpl)(st, children),
        makeDocument: (sections, opts = {}) => (0, document_1.makeDocumentImpl)(st, sections, opts),
        saveDocument: (doc, outputPath) => (0, document_1.saveDocumentImpl)(doc, outputPath),
        diagramBlock: (puml, counter, captionText, opts = {}) => (0, document_1.diagramBlockImpl)(st, puml, counter, captionText, opts),
        lint: (children) => {
            const issues = (0, lint_1.lintChildren)(children);
            (0, lint_1.printLintResults)(issues);
            return issues;
        },
    };
}
//# sourceMappingURL=index.js.map