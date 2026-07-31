import {
  AlignmentType,
  Math as DocxMath,
  MathCurlyBrackets,
  MathFraction,
  MathIntegral,
  MathRadical,
  MathRoundBrackets,
  MathRun,
  MathSquareBrackets,
  MathSubScript,
  MathSubSuperScript,
  MathSum,
  MathSuperScript,
  Paragraph,
} from "docx";
import type { DocxStyleConfig, MathComponent, ParagraphChild, ParagraphOpts, RunDescriptor } from "./types";
import { runImpl, paragraphOptions } from "./paragraph";

export function isMathLike(value: unknown): value is MathComponent {
  return value instanceof DocxMath
    || (typeof value === "object" && value !== null && (value as Record<string, unknown>).constructor.name.startsWith("Math"));
}

export function toMathComponents(value: unknown): MathComponent[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.flatMap((item) => toMathComponents(item));
  if (typeof value === "string" || typeof value === "number") return [new MathRun(String(value))];
  return [value as MathComponent];
}

export function mathExpr(...parts: unknown[]): DocxMath {
  return new DocxMath({ children: parts.flatMap((part) => toMathComponents(part)) });
}

export function mathFraction(numerator: unknown, denominator: unknown): MathFraction {
  return new MathFraction({ numerator: toMathComponents(numerator), denominator: toMathComponents(denominator) });
}

export function mathSub(base: unknown, subScript: unknown): MathSubScript {
  return new MathSubScript({ children: toMathComponents(base), subScript: toMathComponents(subScript) });
}

export function mathSup(base: unknown, superScript: unknown): MathSuperScript {
  return new MathSuperScript({ children: toMathComponents(base), superScript: toMathComponents(superScript) });
}

export function mathSubSup(base: unknown, subScript: unknown, superScript: unknown): MathSubSuperScript {
  return new MathSubSuperScript({
    children: toMathComponents(base),
    subScript: toMathComponents(subScript),
    superScript: toMathComponents(superScript),
  });
}

export function mathParen(...parts: unknown[]): MathRoundBrackets {
  return new MathRoundBrackets({ children: parts.flatMap((part) => toMathComponents(part)) });
}

export function mathBracket(...parts: unknown[]): MathSquareBrackets {
  return new MathSquareBrackets({ children: parts.flatMap((part) => toMathComponents(part)) });
}

export function mathBrace(...parts: unknown[]): MathCurlyBrackets {
  return new MathCurlyBrackets({ children: parts.flatMap((part) => toMathComponents(part)) });
}

export function mathRoot(content: unknown, degree?: unknown): MathRadical {
  return new MathRadical({ children: toMathComponents(content), degree: degree === undefined ? undefined : toMathComponents(degree) });
}

export function mathSum(content: unknown, opts: { subScript?: unknown; superScript?: unknown } = {}): MathSum {
  return new MathSum({
    children: toMathComponents(content),
    subScript: opts.subScript ? toMathComponents(opts.subScript) : undefined,
    superScript: opts.superScript ? toMathComponents(opts.superScript) : undefined,
  });
}

export function mathIntegral(content: unknown, opts: { subScript?: unknown; superScript?: unknown } = {}): MathIntegral {
  return new MathIntegral({
    children: toMathComponents(content),
    subScript: opts.subScript ? toMathComponents(opts.subScript) : undefined,
    superScript: opts.superScript ? toMathComponents(opts.superScript) : undefined,
  });
}

export function paragraphWithMathImpl(st: DocxStyleConfig, parts: Array<string | number | RunDescriptor | MathComponent>, opts: ParagraphOpts = {}): Paragraph {
  const children = parts.map((part): ParagraphChild => {
    if (typeof part === "string" || typeof part === "number") return runImpl(st, part, opts);
    if (part instanceof DocxMath) return part;
    if (Array.isArray(part) || isMathLike(part)) return mathExpr(part);
    const desc = part as RunDescriptor;
    return runImpl(st, desc.text, {
      ...opts,
      size: desc.size ?? opts.size,
      bold: desc.bold ?? opts.bold,
      italics: desc.italics ?? opts.italics,
      allCaps: desc.allCaps ?? opts.allCaps,
      underline: desc.underline ?? opts.underline,
      color: desc.color ?? opts.color,
      font: desc.font ?? opts.font,
    });
  });
  return new Paragraph(paragraphOptions(st, opts, children));
}

export function formulaMathImpl(st: DocxStyleConfig, content: unknown, opts: ParagraphOpts = {}): Paragraph {
  return new Paragraph(paragraphOptions(st, {
    ...opts,
    align: AlignmentType.CENTER,
    noIndent: true,
    before: opts.before ?? st.FORMULA_BEFORE,
    after: opts.after ?? st.FORMULA_AFTER,
  }, [mathExpr(content)]));
}

export function formulaInlineImpl(st: DocxStyleConfig, label: string, mathContent: unknown, opts: ParagraphOpts = {}): Paragraph {
  return new Paragraph(paragraphOptions(st, opts, [runImpl(st, `${label} `, opts), mathExpr(mathContent)]));
}
