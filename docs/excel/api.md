# Excel API

Импорт:

```js
const {
  createExcelGost,
  createExcelStyle,
  HeuristicAutoFitter,
  NullAutoFitter,
  GoogleSheetsAutoFitter,
} = require("@magomed-cmd/gost/excel");
```

## Фабрика и стиль

```ts
createExcelGost(options?: ExcelGostOptions): ExcelGostInstance
createExcelStyle(options?: Partial<ExcelStyleConfig>): ExcelStyleConfig
```

Aliases фабрики:

| Alias | Поле стиля |
| --- | --- |
| `fontSize` | `FONT_SIZE` |
| `fontName` | `FONT_NAME` |
| `headerFill` | `HEADER_FILL` |
| `resultFill` | `RESULT_FILL` |
| `tabColor` | `TAB_COLOR` |

Если переданы alias и верхнерегистровое поле, верхнерегистровое поле имеет приоритет.

Поля `ExcelStyleConfig`:

```text
HEADER_FILL
HEADER_COLOR
RESULT_FILL
RESULT_COLOR
ALT_ROW_FILL
REGRET_FILL
FONT_NAME
FONT_SIZE
TAB_COLOR
DEFAULT_ROW_HEIGHT
PAGE_ORIENTATION
FIT_TO_PAGE
FIT_TO_WIDTH
FIT_TO_HEIGHT
MAX_COLUMN_WIDTH
MAX_ROW_HEIGHT
ROW_HEIGHT_FONT_MULTIPLIER
HEADER_TITLE_SIZE
BORDER_STYLE
```

Экземпляр предоставляет готовые `HEADER_STYLE` и `RESULT_STYLE`.

## Методы экземпляра

<!-- api-methods:start -->

| Метод | Назначение |
| --- | --- |
| `styleCell(cell, options?)` | применить стиль к ячейке |
| `setValue(sheet, address, value, options?)` | записать значение |
| `setFormula(sheet, address, formula, options?)` | записать формулу |
| `applyBaseSheetSetup(sheet, widths)` | применить базовую настройку листа |
| `mergeTitle(sheet, range, text)` | объединить и оформить заголовок |
| `setFreeze(sheet, ySplit, activeCell?)` | закрепить строки |
| `applyZebraStriping(sheet, startRow, endRow, startCol, endCol, headerRows?)` | применить чередование строк |
| `getCellText(cell)` | получить отображаемый текст |
| `autoFitSheet(sheet)` | выполнить локальный этап autofit |
| `autoFitAfterSave(outputPath)` | выполнить post-process после сохранения |
| `formatTableRange(sheet, startRow, endRow, startCol, endCol, headerRow)` | оформить диапазон таблицы |
| `addAhpMatrixBlock(sheet, startRow, title, labels, matrix, randomIndex)` | добавить блок МАИ |
| `addContentsSheet(workbook, sheetNames)` | создать лист содержания |
| `productFormula(addresses, exponent)` | построить формулу произведения |
| `absoluteRef(address)` | сделать абсолютную ссылку |
| `weightedSumFormula(valueAddresses, weightAddresses)` | построить формулу взвешенной суммы |
| `listFormulaRange(sheetName, addresses)` | построить диапазон для списка |

<!-- api-methods:end -->

## Ячейки

```ts
styleCell(cell, options?): void
setValue(sheet, address, value, options?): Cell
setFormula(sheet, address, formula, options?): Cell
getCellText(cell): string
```

`CellStyleOptions`:

```text
fontName, size, bold, color, align, wrapText, fill, border, numFmt
```

- `border: true` использует `style.BORDER_STYLE`.
- `border: "medium"` задаёт конкретный стиль границы.
- `setFormula` принимает формулу без `=`.
- `getCellText` возвращает пустую строку для formula cell без cached value.

## Лист и таблица

```ts
applyBaseSheetSetup(sheet, widths): void
mergeTitle(sheet, range, text): void
setFreeze(sheet, ySplit, activeCell?): void
applyZebraStriping(sheet, startRow, endRow, startCol, endCol, headerRows?): void
formatTableRange(sheet, startRow, endRow, startCol, endCol, headerRow): void
addContentsSheet(workbook, sheetNames): Worksheet
```

- `applyBaseSheetSetup` задаёт высоту строк, параметры печати и базовые ширины колонок.
- `mergeTitle` объединяет диапазон и оформляет его первую ячейку.
- `applyZebraStriping` пропускает переданные header rows и уже оформленные header/result cells.
- `addContentsSheet` создаёт лист `Содержание` с внутренними ссылками.

## Autofit

Интерфейс стратегии:

```ts
// check-docs
interface IAutoFitter {
  fitSheet(sheet, style): void;
  postProcess?(outputPath: string): Promise<void>;
}
```

Подключение:

```js
const excel = createExcelGost({ autoFitter });
```

Методы экземпляра:

```ts
autoFitSheet(sheet): void
autoFitAfterSave(outputPath): Promise<void>
```

| Реализация | `autoFitSheet` | `autoFitAfterSave` |
| --- | --- | --- |
| `HeuristicAutoFitter` | локально оценивает ширины и высоты | no-op |
| `NullAutoFitter` | no-op | no-op |
| `GoogleSheetsAutoFitter` | no-op | облачный autofit и перезапись XLSX |

Ограничения `HeuristicAutoFitter`:

- оценивает ширину по количеству символов, а не по реальным glyph metrics;
- не использует formula cells без cached value;
- учитывает ширину объединённого диапазона при расчёте высоты;
- ограничивает результат через `MAX_COLUMN_WIDTH` и `MAX_ROW_HEIGHT`.

### GoogleSheetsAutoFitter

```ts
new GoogleSheetsAutoFitter({
  credentials: string | object,
  folderId: string,
})
```

Требования:

- optional peer dependency `googleapis`;
- Google Drive API и Google Sheets API;
- service account JSON или уже разобранный объект credentials;
- Drive folder, доступная service account с ролью Editor.

Правильный порядок:

```js
async function saveWorkbook(workbook, excel, outputPath) {
  await workbook.xlsx.writeFile(outputPath);
  await excel.autoFitAfterSave(outputPath);
}
```

Обработка использует первые 200 колонок и первые 2000 строк каждого листа. Исходный XLSX заменяется экспортированным результатом. Временный Google Sheet удаляется в `finally`.

## МАИ

```ts
addAhpMatrixBlock(
  sheet,
  startRow,
  title,
  labels,
  matrix,
  randomIndex,
): {
  weightColumn,
  weightStartRow,
  weightEndRow,
  osCell,
  nextRow,
}
```

`labels` должен быть непустым, а `matrix` — квадратной и совпадать с количеством labels. Иначе выбрасывается `RangeError`.

## Формульные хелперы

```ts
productFormula(addresses, exponent)
absoluteRef(address)
weightedSumFormula(valueAddresses, weightAddresses)
listFormulaRange(sheetName, addresses)
```

Пример:

```js
excel.productFormula(["B4", "C4", "D4"], 3);
excel.absoluteRef("B12");
excel.weightedSumFormula(["B2", "C2"], ["$B$1", "$C$1"]);
excel.listFormulaRange("МАИ", ["B2", "B3"]);
```

## Runtime-экспорты

```text
createExcelGost
createExcelStyle
HeuristicAutoFitter
NullAutoFitter
GoogleSheetsAutoFitter
```

TypeScript дополнительно получает типы из `excel/types` и `GoogleSheetsAutoFitterOptions` через package entrypoint.
