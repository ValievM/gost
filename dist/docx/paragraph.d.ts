import { Paragraph, TextRun } from "docx";
import type { DocxStyleConfig, ParagraphOpts, ParagraphChild, Content } from "./types";
export declare function runImpl(st: DocxStyleConfig, text: string | number, opts?: ParagraphOpts): TextRun;
export declare function paragraphOptions(st: DocxStyleConfig, opts?: ParagraphOpts, children?: ParagraphChild[]): {
    heading: undefined;
    alignment: "left" | "right" | "center" | "end" | "start" | "both" | "mediumKashida" | "distribute" | "numTab" | "highKashida" | "lowKashida" | "thaiDistribute";
    spacing: {
        line: number;
        before: number;
        after: number;
    };
    indent: {
        firstLine: number;
    } | undefined;
    keepNext: boolean;
    keepLines: boolean;
    children: ParagraphChild[];
};
export declare function paragraphChildren(st: DocxStyleConfig, content: Content, opts?: ParagraphOpts): TextRun[];
export declare function paragraphImpl(st: DocxStyleConfig, content: Content, opts?: ParagraphOpts): Paragraph;
export declare function centeredImpl(st: DocxStyleConfig, content: Content, opts?: ParagraphOpts): Paragraph;
export declare function blankImpl(st: DocxStyleConfig, opts?: ParagraphOpts): Paragraph;
export declare function pageBreakImpl(): Paragraph;
export declare function placeholderImpl(st: DocxStyleConfig, label: string, opts?: ParagraphOpts): Paragraph;
