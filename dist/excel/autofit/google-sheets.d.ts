import type { IAutoFitter } from "../types";
export interface GoogleSheetsAutoFitterOptions {
    /**
     * Service account credentials — either a path to the JSON file
     * or the parsed JSON object.
     * Get from: Google Cloud Console → IAM → Service Accounts → Keys.
     * Required APIs: Google Drive API, Google Sheets API.
     */
    credentials: string | object;
    /**
     * Google Drive folder ID to upload temp files into.
     * The folder must be shared with the service account (Editor role).
     * Get ID from the folder URL: drive.google.com/drive/folders/FOLDER_ID
     */
    folderId: string;
}
/**
 * AutoFitter that uploads the xlsx file to Google Sheets, applies
 * pixel-perfect autofit (column widths + row heights), and exports
 * back to xlsx.
 *
 * Advantages over HeuristicAutoFitter:
 *  - Real rendered widths (Google's rendering engine)
 *  - Formula cells are recalculated before measurement
 *  - Correct Cyrillic and mixed-language sizing
 *
 * Requirements:
 *  - `npm install googleapis` (peer dependency)
 *  - Google Cloud project with Drive API + Sheets API enabled
 *  - Service account with Editor access to Drive
 *
 * Usage:
 *  ```ts
 *  const g = createExcelGost({
 *      autoFitter: new GoogleSheetsAutoFitter({
 *          credentials: "./service-account.json",
 *      }),
 *  });
 *  // ... build workbook ...
 *  await workbook.xlsx.writeFile(outputPath);
 *  await g.autoFitAfterSave(outputPath);  // uploads, autofits, downloads
 *  ```
 */
export declare class GoogleSheetsAutoFitter implements IAutoFitter {
    private readonly opts;
    constructor(opts: GoogleSheetsAutoFitterOptions);
    /** No-op — Google Sheets works on the full file, not per-sheet. */
    fitSheet(): void;
    postProcess(outputPath: string): Promise<void>;
    private resolveCredentials;
}
