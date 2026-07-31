"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageBlockImpl = imageBlockImpl;
const fs_1 = __importDefault(require("fs"));
const docx_1 = require("docx");
const plantuml_size_1 = require("../plantuml-size");
const lint_1 = require("../lint");
function imageBlockImpl(st, src, widthOrOpts, height, opts = {}) {
    const data = Buffer.isBuffer(src) ? src : fs_1.default.readFileSync(src);
    let w, h, effectiveOpts;
    if (typeof widthOrOpts === "number") {
        // imageBlock(src, width, height, opts?)
        w = widthOrOpts;
        h = height;
        effectiveOpts = opts;
    }
    else {
        // imageBlock(src, opts?) — авто-размер из PNG-байт (PNG spec: bytes 16-19 width, 20-23 height)
        effectiveOpts = widthOrOpts ?? {};
        if (data.length < 24 || data.toString("ascii", 1, 4) !== "PNG") {
            throw new Error("imageBlock(): авто-определение размеров поддерживает только PNG. " +
                "Передай width и height явно для JPG/BMP/GIF.");
        }
        const maxWidth = effectiveOpts.maxWidth ?? Math.round((st.CONTENT_WIDTH / 1440) * 96);
        const sized = (0, plantuml_size_1.autoImageSize)(data, maxWidth, effectiveOpts.sourceDpi ?? 96, effectiveOpts.fit ?? "natural");
        w = sized.width;
        h = sized.height;
    }
    return (0, lint_1.tagElement)(new docx_1.Paragraph({
        alignment: effectiveOpts.align || docx_1.AlignmentType.CENTER,
        spacing: {
            line: effectiveOpts.line ?? st.LINE,
            before: effectiveOpts.before ?? st.IMAGE_BEFORE,
            after: effectiveOpts.after ?? st.IMAGE_AFTER,
        },
        keepNext: effectiveOpts.keepNext !== undefined ? !!effectiveOpts.keepNext : true,
        keepLines: effectiveOpts.keepLines !== undefined ? effectiveOpts.keepLines : true,
        children: [new docx_1.ImageRun({ data, type: effectiveOpts.imageType ?? "png", transformation: { width: w, height: h } })],
    }), "image");
}
//# sourceMappingURL=image.js.map