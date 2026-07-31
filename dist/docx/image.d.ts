import { Paragraph } from "docx";
import type { DocxStyleConfig, ImageBlockOpts } from "./types";
export declare function imageBlockImpl(st: DocxStyleConfig, src: string | Buffer, widthOrOpts?: number | ImageBlockOpts, height?: number, opts?: ImageBlockOpts): Paragraph;
