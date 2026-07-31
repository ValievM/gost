export { colLetter } from "./utils";
/** Geometric mean formula: (a1*a2*...*aN)^(1/N) */
export declare function productFormula(addresses: string[], exponent: number): string;
/** Converts a relative cell address to absolute: "B5" → "$B$5" */
export declare function absoluteRef(address: string): string;
/** Builds a SUMPRODUCT-style formula: v1*w1+v2*w2+... */
export declare function weightedSumFormula(valueAddresses: string[], weightAddresses: string[]): string;
/** Builds a comma-separated list of cross-sheet references for use in formulas */
export declare function listFormulaRange(sheetName: string, addresses: string[]): string;
