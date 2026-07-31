"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeLineImpl = codeLineImpl;
exports.codeFileImpl = codeFileImpl;
const fs_1 = __importDefault(require("fs"));
const paragraph_1 = require("./paragraph");
const lint_1 = require("../lint");
function codeLineImpl(st, text, opts = {}) {
    return (0, lint_1.tagElement)((0, paragraph_1.paragraphImpl)(st, [{ text, font: opts.font ?? st.CODE_FONT, size: opts.size ?? st.SIZE_CODE }], {
        ...opts,
        noIndent: true,
        line: opts.line ?? st.LINE,
    }), "codeLine");
}
function codeFileImpl(st, filePath, opts = {}) {
    const content = fs_1.default.readFileSync(filePath, "utf8")
        .replace(/\r\n/g, "\n") // Windows CRLF → LF
        .replace(/\t/g, "  "); // табы → 2 пробела (читаемо в Courier New)
    const lines = content.split("\n");
    if (lines[lines.length - 1] === "")
        lines.pop(); // файл заканчивается \n → убираем пустую строку
    return lines.map((line) => codeLineImpl(st, line, opts));
}
