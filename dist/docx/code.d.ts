import { Paragraph } from "docx";
import type { DocxStyleConfig, ParagraphOpts } from "./types";
export declare function codeLineImpl(st: DocxStyleConfig, text: string, opts?: ParagraphOpts): Paragraph;
export declare function codeFileImpl(st: DocxStyleConfig, filePath: string, opts?: ParagraphOpts): Paragraph[];
