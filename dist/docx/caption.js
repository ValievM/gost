"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captionImpl = captionImpl;
exports.tableCaptionImpl = tableCaptionImpl;
exports.createCaptionCounterImpl = createCaptionCounterImpl;
const docx_1 = require("docx");
const paragraph_1 = require("./paragraph");
const lint_1 = require("../lint");
function captionImpl(st, text, opts = {}) {
    return (0, lint_1.tagElement)((0, paragraph_1.centeredImpl)(st, text, {
        ...opts,
        before: opts.before ?? st.CAPTION_BEFORE,
        after: opts.after ?? st.CAPTION_AFTER,
        size: opts.size ?? st.SIZE,
    }), "caption");
}
function tableCaptionImpl(st, text, opts = {}) {
    return (0, lint_1.tagElement)((0, paragraph_1.paragraphImpl)(st, text, {
        ...opts,
        align: docx_1.AlignmentType.LEFT,
        noIndent: true,
        before: opts.before ?? st.TABLE_CAPTION_BEFORE,
        after: opts.after ?? st.TABLE_CAPTION_AFTER,
        size: opts.size ?? st.SIZE,
    }), "tableCaption");
}
function createCaptionCounterImpl(st, prefix, opts = {}) {
    let n = opts.start ?? 1;
    const fn = opts.table ? tableCaptionImpl : captionImpl;
    return {
        peek: () => n,
        caption: (text) => fn(st, `${prefix} ${n++} – ${text}`, opts),
    };
}
//# sourceMappingURL=caption.js.map