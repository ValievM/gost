export { colLetter } from "./utils";

/** Geometric mean formula: (a1*a2*...*aN)^(1/N) */
export function productFormula(addresses: string[], exponent: number): string {
    return `(${addresses.join("*")})^(1/${exponent})`;
}

/** Converts a relative cell address to absolute: "B5" → "$B$5" */
export function absoluteRef(address: string): string {
    const match = address.match(/^([A-Z]+)(\d+)$/);
    return match ? `$${match[1]}$${match[2]}` : address;
}

/** Builds a SUMPRODUCT-style formula: v1*w1+v2*w2+... */
export function weightedSumFormula(valueAddresses: string[], weightAddresses: string[]): string {
    return valueAddresses.map((address, index) => `${address}*${weightAddresses[index]}`).join("+");
}

/** Builds a comma-separated list of cross-sheet references for use in formulas */
export function listFormulaRange(sheetName: string, addresses: string[]): string {
    return addresses.map((address) => `'${sheetName}'!${address}`).join(",");
}

