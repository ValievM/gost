import {
  createDocxGost,
  mathExpr,
  mathFraction,
  type CellValue,
  type DocxGostInstance,
} from "@magomed-cmd/gost/docx";
import {
  createPlantUmlGost,
  type PlantUmlGostInstance,
} from "@magomed-cmd/gost/plantuml";
import {
  createExcelGost,
  type ExcelGostInstance,
} from "@magomed-cmd/gost/excel";

type IsAny<T> = 0 extends (1 & T) ? true : false;
type AssertFalse<T extends false> = T;
type CellValueMustNotBeAny = AssertFalse<IsAny<CellValue>>;

const docx: DocxGostInstance = createDocxGost();
const plantuml: PlantUmlGostInstance = createPlantUmlGost();
const excel: ExcelGostInstance = createExcelGost();

const validCells: CellValue[][] = [
  ["Показатель", "Значение"],
  ["Коэффициент", mathFraction(10, 3)],
  [{ text: ["Итого: ", { text: "x", italics: true }, mathExpr(" = 1")], bold: true }, 1],
];

docx.makeTable(validCells);
docx.makeContentSection([docx.h1("Раздел")]);
plantuml.classDiagram().class("Report").build();
excel.productFormula(["A1", "A2"], 0.5);

// @ts-expect-error CellValue не принимает произвольные объекты
const invalidCell: CellValue = { unexpected: true };
// @ts-expect-error вложенный CellDescriptor не является содержимым ячейки
const nestedDescriptor: CellValue = { text: { text: "x", colspan: 2 } };
// @ts-expect-error makeContentSection не имеет игнорируемых опций
docx.makeContentSection([], { ignored: true });
// @ts-expect-error неизвестного builder нет в публичном PlantUML API
plantuml.reportDiagram();
// @ts-expect-error exponent обязан быть числом
excel.productFormula(["A1"], "0.5");

void invalidCell;
void nestedDescriptor;
void (null as unknown as CellValueMustNotBeAny);
