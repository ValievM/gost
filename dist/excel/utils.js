"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colLetter = colLetter;
/** Converts a 0-based column index to Excel column letter (0→A, 25→Z, 26→AA) */
function colLetter(zeroBasedIndex) {
    if (!Number.isInteger(zeroBasedIndex) || zeroBasedIndex < 0) {
        throw new RangeError("Column index must be a non-negative integer");
    }
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let n = zeroBasedIndex + 1;
    let result = "";
    while (n > 0) {
        const remainder = (n - 1) % 26;
        result = alphabet[remainder] + result;
        n = Math.floor((n - 1) / 26);
    }
    return result;
}
