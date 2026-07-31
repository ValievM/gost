import { Math as DocxMath, MathCurlyBrackets, MathFraction, MathIntegral, MathRadical, MathRoundBrackets, MathSquareBrackets, MathSubScript, MathSubSuperScript, MathSum, MathSuperScript, Paragraph } from "docx";
import type { DocxStyleConfig, MathComponent, ParagraphOpts, RunDescriptor } from "./types";
export declare function isMathLike(value: unknown): value is MathComponent;
export declare function toMathComponents(value: unknown): MathComponent[];
export declare function mathExpr(...parts: unknown[]): DocxMath;
export declare function mathFraction(numerator: unknown, denominator: unknown): MathFraction;
export declare function mathSub(base: unknown, subScript: unknown): MathSubScript;
export declare function mathSup(base: unknown, superScript: unknown): MathSuperScript;
export declare function mathSubSup(base: unknown, subScript: unknown, superScript: unknown): MathSubSuperScript;
export declare function mathParen(...parts: unknown[]): MathRoundBrackets;
export declare function mathBracket(...parts: unknown[]): MathSquareBrackets;
export declare function mathBrace(...parts: unknown[]): MathCurlyBrackets;
export declare function mathRoot(content: unknown, degree?: unknown): MathRadical;
export declare function mathSum(content: unknown, opts?: {
    subScript?: unknown;
    superScript?: unknown;
}): MathSum;
export declare function mathIntegral(content: unknown, opts?: {
    subScript?: unknown;
    superScript?: unknown;
}): MathIntegral;
export declare function paragraphWithMathImpl(st: DocxStyleConfig, parts: Array<string | number | RunDescriptor | MathComponent>, opts?: ParagraphOpts): Paragraph;
export declare function formulaMathImpl(st: DocxStyleConfig, content: unknown, opts?: ParagraphOpts): Paragraph;
export declare function formulaInlineImpl(st: DocxStyleConfig, label: string, mathContent: unknown, opts?: ParagraphOpts): Paragraph;
//# sourceMappingURL=math.d.ts.map