# DOCX API

## Экспорты модуля

Основные runtime-экспорты:

```js
const {
  createDocxGost,
  DEFAULT_DOCX_STYLE,
  createDocxStyle,
  TableOfContents,
  lintChildren,
  printLintResults,
  mathExpr,
  mathFraction,
  mathSub,
  mathSup,
  mathSubSup,
  mathParen,
  mathBracket,
  mathBrace,
  mathRoot,
  mathSum,
  mathIntegral,
  toMathComponents,
} = require("@magomed-cmd/gost/docx");
```

TypeScript-типы экспортируются из того же entrypoint.

## Фабрика

```ts
// check-docs
declare function createDocxGost(options?: {
  style?: Partial<Omit<DocxStyleConfig, "PAGE" | "TABLE_CELL_MARGINS">> & {
    PAGE?: {
      size?: Partial<DocxStyleConfig["PAGE"]["size"]>;
      margin?: Partial<DocxStyleConfig["PAGE"]["margin"]>;
    };
    TABLE_CELL_MARGINS?: Partial<DocxStyleConfig["TABLE_CELL_MARGINS"]>;
    font?: string;
    size?: number;
    sizeTitle?: number;
    sizeHeader?: number;
    sizeCode?: number;
    indent?: number;
    line?: number;
    contentWidth?: number;
    codeFont?: string;
    page?: {
      size?: Partial<DocxStyleConfig["PAGE"]["size"]>;
      margin?: Partial<DocxStyleConfig["PAGE"]["margin"]>;
    };
  };
}): DocxGostInstance;
```

`page.margin`, `page.size` и `TABLE_CELL_MARGINS` объединяются с defaults
по полям; допускаются частичные вложенные объекты.

## Методы экземпляра

<!-- api-methods:start -->

| Метод | Возвращает | Тема |
| --- | --- | --- |
| `run(text, opts?)` | `TextRun` | [контент](content.md) |
| `paragraph(content, opts?)` | `Paragraph` | [контент](content.md) |
| `centered(content, opts?)` | `Paragraph` | [контент](content.md) |
| `paragraphWithMath(parts, opts?)` | `Paragraph` | [математика](tables-and-math.md) |
| `h1(text, opts?)` | `Paragraph` | [контент](content.md) |
| `h2(text, opts?)` | `Paragraph` | [контент](content.md) |
| `h3(text, opts?)` | `Paragraph` | [контент](content.md) |
| `blank(opts?)` | `Paragraph` | [контент](content.md) |
| `pageBreak()` | `Paragraph` | [контент](content.md) |
| `caption(text, opts?)` | `Paragraph` | [контент](content.md) |
| `tableCaption(text, opts?)` | `Paragraph` | [контент](content.md) |
| `createCaptionCounter(prefix, opts?)` | `CaptionCounter` | [контент](content.md) |
| `placeholder(label, opts?)` | `Paragraph` | [изображения](images-and-diagrams.md) |
| `imageBlock(...)` | `Paragraph` | [изображения](images-and-diagrams.md) |
| `codeLine(text, opts?)` | `Paragraph` | [контент](content.md) |
| `codeBlock(lines, opts?)` | `Paragraph[]` | [контент](content.md) |
| `codeFile(path, opts?)` | `Paragraph[]` | [контент](content.md) |
| `list(items, type?, opts?)` | `Paragraph[]` | [контент](content.md) |
| `appendix(letter, title, kind?)` | `Paragraph[]` | [контент](content.md) |
| `formulaMath(content, opts?)` | `Paragraph` | [математика](tables-and-math.md) |
| `formulaInline(label, math, opts?)` | `Paragraph` | [математика](tables-and-math.md) |
| `makeTable(rows, opts?)` | `Table` | [таблицы](tables-and-math.md) |
| `makeTitlePage(opts)` | `DocxSection` | [документ](document-and-styles.md) |
| `makeContentSection(children)` | `DocxSection` | [документ](document-and-styles.md) |
| `makeDocument(sections, opts?)` | `Document` | [документ](document-and-styles.md) |
| `saveDocument(doc, path)` | `Promise<void>` | [документ](document-and-styles.md) |
| `diagramBlock(puml, counter, text, opts?)` | `Promise<Paragraph[]>` | [диаграммы](images-and-diagrams.md) |
| `lint(children)` | `LintIssue[]` | [lint](lint.md) |

<!-- api-methods:end -->

Экземпляр также содержит readonly `style: DocxStyleConfig`.

## Общие опции текста

`ParagraphOpts`:

| Поле | Тип/смысл |
| --- | --- |
| `align` | `left`, `center`, `right`, `both` или значение `AlignmentType` |
| `noIndent` | убрать красную строку |
| `indent` | отступ первой строки, DXA |
| `line` | межстрочный интервал |
| `before`, `after` | интервалы до/после |
| `bold`, `italics`, `allCaps`, `underline` | оформление |
| `size` | half-points: `28` = 14 pt |
| `color`, `font` | цвет без `#`, имя шрифта |
| `keepNext`, `keepLines` | управление разрывами Word |
| `imageType` | `png`, `jpg`, `gif`, `bmp`; используется изображениями |

`h1/h2/h3` принимают эти опции, но принудительно задают собственные интервалы,
`keepNext`, а `h1` — ещё центрирование и отсутствие красной строки.
