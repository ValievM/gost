import { TableOfContents } from "docx";
import type { DocxGostOptions, DocxGostInstance, ImageBlockOpts } from "./types";
import { createDocxStyle } from "./style";
import { runImpl, paragraphImpl, centeredImpl, blankImpl, pageBreakImpl, placeholderImpl } from "./paragraph";
import { paragraphWithMathImpl, formulaMathImpl, formulaInlineImpl } from "./math";
import { h1Impl, h2Impl, h3Impl, listImpl, appendixImpl } from "./heading";
import { captionImpl, tableCaptionImpl, createCaptionCounterImpl } from "./caption";
import { imageBlockImpl } from "./image";
import { codeLineImpl, codeFileImpl } from "./code";
import { makeTableImpl } from "./table";
import { makeTitlePageImpl, makeContentSectionImpl, makeDocumentImpl, saveDocumentImpl, diagramBlockImpl } from "./document";
import { lintChildren, printLintResults } from "../lint";

export * from "./types";
export * from "./style";
export * from "./math";
export { TableOfContents };
export { lintChildren, printLintResults } from "../lint";

export function createDocxGost(factoryOpts: DocxGostOptions = {}): DocxGostInstance {
  const st = createDocxStyle(factoryOpts.style);
  return {
    style: st,
    run: (text, opts = {}) => runImpl(st, text, opts),
    paragraph: (content, opts = {}) => paragraphImpl(st, content, opts),
    centered: (content, opts = {}) => centeredImpl(st, content, opts),
    paragraphWithMath: (parts, opts = {}) => paragraphWithMathImpl(st, parts, opts),
    h1: (text, opts = {}) => h1Impl(st, text, opts),
    h2: (text, opts = {}) => h2Impl(st, text, opts),
    h3: (text, opts = {}) => h3Impl(st, text, opts),
    blank: (opts = {}) => blankImpl(st, opts),
    pageBreak: () => pageBreakImpl(),
    caption: (text, opts = {}) => captionImpl(st, text, opts),
    tableCaption: (text, opts = {}) => tableCaptionImpl(st, text, opts),
    createCaptionCounter: (prefix, opts = {}) => createCaptionCounterImpl(st, prefix, opts),
    placeholder: (label, opts = {}) => placeholderImpl(st, label, opts),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    imageBlock: (src: string | Buffer, wOrOpts?: any, h?: number, opts?: ImageBlockOpts) =>
      imageBlockImpl(st, src, wOrOpts, h, opts ?? {}),
    codeLine: (text, opts = {}) => codeLineImpl(st, text, opts),
    codeBlock: (lines, opts = {}) => lines.map((line) => codeLineImpl(st, line, opts)),
    codeFile: (filePath, opts = {}) => codeFileImpl(st, filePath, opts),
    list: (items, type = "bullet", opts = {}) => listImpl(st, items, type, opts),
    appendix: (letter, title, kind) => appendixImpl(st, letter, title, kind),
    formulaMath: (content, opts = {}) => formulaMathImpl(st, content, opts),
    formulaInline: (label, math, opts = {}) => formulaInlineImpl(st, label, math, opts),
    makeTable: (rows, opts = {}) => makeTableImpl(st, rows, opts),
    makeTitlePage: (opts) => makeTitlePageImpl(st, opts),
    makeContentSection: (children) => makeContentSectionImpl(st, children),
    makeDocument: (sections, opts = {}) => makeDocumentImpl(st, sections, opts),
    saveDocument: (doc, outputPath) => saveDocumentImpl(doc, outputPath),
    diagramBlock: (puml, counter, captionText, opts = {}) =>
      diagramBlockImpl(st, puml, counter, captionText, opts),
    lint: (children) => {
      const issues = lintChildren(children);
      printLintResults(issues);
      return issues;
    },
  };
}
