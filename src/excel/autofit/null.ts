import type { IAutoFitter } from "../types";

/**
 * No-op AutoFitter — leaves all widths/heights unchanged.
 * Use when:
 *  - Widths are set manually via applyBaseSheetSetup
 *  - Testing (no side effects)
 *  - Post-processing handles sizing externally (LibreOffice, Google Sheets API)
 */
export class NullAutoFitter implements IAutoFitter {
    fitSheet(): void {
        // intentional no-op
    }
}
