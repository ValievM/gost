import { TableOfContents } from "docx";
import type { DocxGostOptions, DocxGostInstance } from "./types";
export * from "./types";
export * from "./style";
export { toMathComponents, mathExpr, mathFraction, mathSub, mathSup, mathSubSup, mathParen, mathBracket, mathBrace, mathRoot, mathSum, mathIntegral, } from "./math";
export { TableOfContents };
export { lintChildren, printLintResults } from "../lint";
export declare function createDocxGost(factoryOpts?: DocxGostOptions): DocxGostInstance;
//# sourceMappingURL=index.d.ts.map