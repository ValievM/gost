"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetsAutoFitter = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
class GoogleSheetsAutoFitter {
    constructor(opts) {
        this.opts = { ...opts };
    }
    /** No-op — Google Sheets works on the full file, not per-sheet. */
    fitSheet() { }
    async postProcess(outputPath) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        let googleapis;
        try {
            googleapis = require("googleapis");
        }
        catch {
            throw new Error("GoogleSheetsAutoFitter requires the 'googleapis' package.\n" +
                "Install it: npm install googleapis");
        }
        const { google } = googleapis;
        const credentials = this.resolveCredentials();
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: [
                "https://www.googleapis.com/auth/drive",
                "https://www.googleapis.com/auth/spreadsheets",
            ],
        });
        const drive = google.drive({ version: "v3", auth });
        const sheets = google.sheets({ version: "v4", auth });
        const { folderId } = this.opts;
        const fileName = path_1.default.basename(outputPath);
        // 1. Upload xlsx to Google Drive → convert to Google Sheets format
        const uploadRes = await drive.files.create({
            requestBody: {
                name: fileName,
                mimeType: "application/vnd.google-apps.spreadsheet",
                parents: [folderId],
            },
            media: {
                mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                body: fs_1.default.createReadStream(outputPath),
            },
        });
        const spreadsheetId = uploadRes.data.id;
        try {
            // 2. Get all sheet IDs
            const metaRes = await sheets.spreadsheets.get({ spreadsheetId });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sheetIds = (metaRes.data.sheets ?? []).map((s) => s.properties?.sheetId).filter(Boolean);
            // 3. Autofit columns and rows on every sheet
            const requests = sheetIds.flatMap((sheetId) => [
                {
                    autoResizeDimensions: {
                        dimensions: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 200 },
                    },
                },
                {
                    autoResizeDimensions: {
                        dimensions: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 2000 },
                    },
                },
            ]);
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: { requests },
            });
            // 4. Export back as xlsx
            const exportRes = await drive.files.export({ fileId: spreadsheetId, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, { responseType: "arraybuffer" });
            fs_1.default.writeFileSync(outputPath, Buffer.from(exportRes.data));
        }
        finally {
            // 5. Always clean up the temp Google Sheets file
            await drive.files.delete({ fileId: spreadsheetId }).catch(() => { });
        }
    }
    resolveCredentials() {
        const { credentials } = this.opts;
        if (typeof credentials === "string") {
            const raw = fs_1.default.readFileSync(credentials, "utf-8");
            return JSON.parse(raw);
        }
        return credentials;
    }
}
exports.GoogleSheetsAutoFitter = GoogleSheetsAutoFitter;
//# sourceMappingURL=google-sheets.js.map