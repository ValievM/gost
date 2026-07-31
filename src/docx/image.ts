import fs from "fs";
import { AlignmentType, ImageRun, Paragraph } from "docx";
import type { DocxStyleConfig, ImageBlockOpts } from "./types";
import { autoImageSize } from "../plantuml-size";
import { tagElement } from "../lint";

export function imageBlockImpl(
  st: DocxStyleConfig,
  src: string | Buffer,
  widthOrOpts?: number | ImageBlockOpts,
  height?: number,
  opts: ImageBlockOpts = {}
): Paragraph {
  const data = Buffer.isBuffer(src) ? src : fs.readFileSync(src);
  let w: number, h: number, effectiveOpts: ImageBlockOpts;

  if (typeof widthOrOpts === "number") {
    // imageBlock(src, width, height, opts?)
    w = widthOrOpts;
    h = height!;
    effectiveOpts = opts;
  } else {
    // imageBlock(src, opts?) — авто-размер из PNG-байт (PNG spec: bytes 16-19 width, 20-23 height)
    effectiveOpts = widthOrOpts ?? {};
    if (data.length < 24 || data.toString("ascii", 1, 4) !== "PNG") {
      throw new Error(
        "imageBlock(): авто-определение размеров поддерживает только PNG. " +
        "Передай width и height явно для JPG/BMP/GIF."
      );
    }
    const maxWidth = effectiveOpts.maxWidth ?? Math.round((st.CONTENT_WIDTH / 1440) * 96);
    const sized = autoImageSize(
      data,
      maxWidth,
      effectiveOpts.sourceDpi ?? 96,
      effectiveOpts.fit ?? "natural",
    );
    w = sized.width;
    h = sized.height;
  }

  return tagElement(new Paragraph({
    alignment: (effectiveOpts.align as (typeof AlignmentType)[keyof typeof AlignmentType]) || AlignmentType.CENTER,
    spacing: {
      line: effectiveOpts.line ?? st.LINE,
      before: effectiveOpts.before ?? st.IMAGE_BEFORE,
      after: effectiveOpts.after ?? st.IMAGE_AFTER,
    },
    keepNext: effectiveOpts.keepNext !== undefined ? !!effectiveOpts.keepNext : true,
    keepLines: effectiveOpts.keepLines !== undefined ? effectiveOpts.keepLines : true,
    children: [new ImageRun({ data, type: effectiveOpts.imageType ?? "png", transformation: { width: w, height: h } } as ConstructorParameters<typeof ImageRun>[0])],
  }), "image");
}
