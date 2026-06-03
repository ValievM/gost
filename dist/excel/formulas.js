"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colLetter = void 0;
exports.productFormula = productFormula;
exports.absoluteRef = absoluteRef;
exports.weightedSumFormula = weightedSumFormula;
exports.listFormulaRange = listFormulaRange;
var utils_1 = require("./utils");
Object.defineProperty(exports, "colLetter", { enumerable: true, get: function () { return utils_1.colLetter; } });
/** Geometric mean formula: (a1*a2*...*aN)^(1/N) */
function productFormula(addresses, exponent) {
    return `(${addresses.join("*")})^(1/${exponent})`;
}
/** Converts a relative cell address to absolute: "B5" → "$B$5" */
function absoluteRef(address) {
    const match = address.match(/^([A-Z]+)(\d+)$/);
    return match ? `$${match[1]}$${match[2]}` : address;
}
/** Builds a SUMPRODUCT-style formula: v1*w1+v2*w2+... */
function weightedSumFormula(valueAddresses, weightAddresses) {
    return valueAddresses.map((address, index) => `${address}*${weightAddresses[index]}`).join("+");
}
/** Builds a comma-separated list of cross-sheet references for use in formulas */
function listFormulaRange(sheetName, addresses) {
    return addresses.map((address) => `'${sheetName}'!${address}`).join(",");
}
//# sourceMappingURL=formulas.js.map