# Excel: быстрый старт

Модуль `@magomed-cmd/gost/excel` добавляет ГОСТ-стили и хелперы поверх `exceljs`. `Workbook` создаёт пользователь.

## Локальный autofit

По умолчанию используется локальный `HeuristicAutoFitter`.

```js
const ExcelJS = require("exceljs");
const { createExcelGost } = require("@magomed-cmd/gost/excel");

async function main() {
  const workbook = new ExcelJS.Workbook();
  const excel = createExcelGost({ fontSize: 14 });
  const sheet = workbook.addWorksheet("Расчёт");

  excel.applyBaseSheetSetup(sheet, [24, 18]);
  excel.mergeTitle(sheet, "A1:B1", "РАСЧЁТ");
  excel.setValue(sheet, "A3", "Показатель", excel.HEADER_STYLE);
  excel.setValue(sheet, "B3", "Значение", excel.HEADER_STYLE);
  excel.setValue(sheet, "A4", "Сумма", { border: true, align: "left" });
  excel.setFormula(sheet, "B4", "SUM(B5:B10)", {
    border: true,
    numFmt: "0.000",
  });

  excel.formatTableRange(sheet, 3, 4, 1, 2, 3);
  excel.autoFitSheet(sheet);
  await workbook.xlsx.writeFile("report.xlsx");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Формулы передаются без начального `=`.

## Выбор autofitter

```js
const {
  createExcelGost,
  HeuristicAutoFitter,
  NullAutoFitter,
} = require("@magomed-cmd/gost/excel");

const local = createExcelGost({
  autoFitter: new HeuristicAutoFitter(),
});

const manual = createExcelGost({
  autoFitter: new NullAutoFitter(),
});
```

- `HeuristicAutoFitter` — локальная синхронная оценка по длине текста; используется по умолчанию.
- `NullAutoFitter` — ничего не меняет; подходит для полностью ручных размеров.
- `GoogleSheetsAutoFitter` — облачный post-processing после сохранения файла.

## Google Sheets autofit

Установите optional peer dependency:

```bash
npm install googleapis
```

Подготовьте Google Cloud:

1. Включите Google Drive API и Google Sheets API.
2. Создайте service account и JSON-ключ.
3. Создайте папку Google Drive.
4. Дайте service account роль Editor для этой папки.
5. Скопируйте ID папки из её URL.

```js
const ExcelJS = require("exceljs");
const {
  createExcelGost,
  GoogleSheetsAutoFitter,
} = require("@magomed-cmd/gost/excel");

async function main() {
  const outputPath = "report.xlsx";
  const workbook = new ExcelJS.Workbook();
  const excel = createExcelGost({
    autoFitter: new GoogleSheetsAutoFitter({
      credentials: "./service-account.json",
      folderId: "GOOGLE_DRIVE_FOLDER_ID",
    }),
  });

  const sheet = workbook.addWorksheet("Расчёт");
  excel.applyBaseSheetSetup(sheet, [24, 18]);
  excel.setValue(sheet, "A1", "Показатель", excel.HEADER_STYLE);
  excel.setValue(sheet, "B1", "Значение", excel.HEADER_STYLE);

  // Для GoogleSheetsAutoFitter это no-op, но вызов безопасен.
  excel.autoFitSheet(sheet);

  await workbook.xlsx.writeFile(outputPath);
  await excel.autoFitAfterSave(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

`autoFitAfterSave()` загружает XLSX во временный Google Sheet, пересчитывает и подбирает размеры, экспортирует результат поверх исходного файла и удаляет временный документ.

Полный API: [api.md](./api.md).
