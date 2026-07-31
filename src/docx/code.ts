import fs from "fs";
import { Paragraph } from "docx";
import type { DocxStyleConfig, ParagraphOpts } from "./types";
import { paragraphImpl } from "./paragraph";
import { tagElement } from "../lint";

export function codeLineImpl(st: DocxStyleConfig, text: string, opts: ParagraphOpts = {}): Paragraph {
  return tagElement(paragraphImpl(st, [{ text, font: opts.font ?? st.CODE_FONT, size: opts.size ?? st.SIZE_CODE }], {
    ...opts,
    noIndent: true,
    line: opts.line ?? st.LINE,
  }), "codeLine");
}

export function codeFileImpl(st: DocxStyleConfig, filePath: string, opts: ParagraphOpts = {}): Paragraph[] {
  const content = fs.readFileSync(filePath, "utf8")
    .replace(/\r\n/g, "\n")   // Windows CRLF → LF
    .replace(/\t/g, "  ");    // табы → 2 пробела (читаемо в Courier New)
  const lines = content.split("\n");
  if (lines[lines.length - 1] === "") lines.pop(); // файл заканчивается \n → убираем пустую строку
  return lines.map((line) => codeLineImpl(st, line, opts));
}
