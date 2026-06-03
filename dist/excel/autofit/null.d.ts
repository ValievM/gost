import type { IAutoFitter } from "../types";
/**
 * No-op AutoFitter — leaves all widths/heights unchanged.
 * Use when:
 *  - Widths are set manually via applyBaseSheetSetup
 *  - Testing (no side effects)
 *  - Post-processing handles sizing externally (LibreOffice, Google Sheets API)
 */
export declare class NullAutoFitter implements IAutoFitter {
    fitSheet(): void;
}
//# sourceMappingURL=null.d.ts.map