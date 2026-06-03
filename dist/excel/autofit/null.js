"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullAutoFitter = void 0;
/**
 * No-op AutoFitter — leaves all widths/heights unchanged.
 * Use when:
 *  - Widths are set manually via applyBaseSheetSetup
 *  - Testing (no side effects)
 *  - Post-processing handles sizing externally (LibreOffice, Google Sheets API)
 */
class NullAutoFitter {
    fitSheet() {
        // intentional no-op
    }
}
exports.NullAutoFitter = NullAutoFitter;
//# sourceMappingURL=null.js.map