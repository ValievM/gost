import { AlignmentType, Paragraph } from "docx";
import type { DocxStyleConfig, ParagraphOpts, CaptionCounterOpts, CaptionCounter } from "./types";
import { paragraphImpl, centeredImpl } from "./paragraph";
import { tagElement } from "../lint";

export function captionImpl(st: DocxStyleConfig, text: string, opts: ParagraphOpts = {}): Paragraph {
  return tagElement(centeredImpl(st, text, {
    ...opts,
    before: opts.before ?? st.CAPTION_BEFORE,
    after: opts.after ?? st.CAPTION_AFTER,
    size: opts.size ?? st.SIZE,
  }), "caption");
}

export function tableCaptionImpl(st: DocxStyleConfig, text: string, opts: ParagraphOpts = {}): Paragraph {
  return tagElement(paragraphImpl(st, text, {
    ...opts,
    align: AlignmentType.LEFT,
    noIndent: true,
    before: opts.before ?? st.TABLE_CAPTION_BEFORE,
    after: opts.after ?? st.TABLE_CAPTION_AFTER,
    size: opts.size ?? st.SIZE,
  }), "tableCaption");
}

export function createCaptionCounterImpl(st: DocxStyleConfig, prefix: string, opts: CaptionCounterOpts = {}): CaptionCounter {
  let n = opts.start ?? 1;
  const fn = opts.table ? tableCaptionImpl : captionImpl;
  return {
    peek: () => n,
    caption: (text: string) => fn(st, `${prefix} ${n++} – ${text}`, opts),
  };
}
