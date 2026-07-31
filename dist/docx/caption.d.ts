import { Paragraph } from "docx";
import type { DocxStyleConfig, ParagraphOpts, CaptionCounterOpts, CaptionCounter } from "./types";
export declare function captionImpl(st: DocxStyleConfig, text: string, opts?: ParagraphOpts): Paragraph;
export declare function tableCaptionImpl(st: DocxStyleConfig, text: string, opts?: ParagraphOpts): Paragraph;
export declare function createCaptionCounterImpl(st: DocxStyleConfig, prefix: string, opts?: CaptionCounterOpts): CaptionCounter;
//# sourceMappingURL=caption.d.ts.map