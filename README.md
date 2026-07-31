# @magomed-cmd/gost

Генератор учебных отчётов ИТА ЮФУ в Таганроге:

- DOCX: титульный лист, разделы, таблицы, формулы, рисунки, листинги и приложения;
- PlantUML: 12 программных builders и рендер PNG/SVG;
- Excel: оформление расчётных книг.

Документация намеренно устроена просто: весь основной сценарий DOCX + PlantUML
находится в этом файле. Excel вынесен отдельно, чтобы не занимать контекст AI,
когда нужен только отчёт.

`makeTitlePage()` предназначен для ИТА ЮФУ: организация и город Таганрог
зашиты в текущий шаблон.

## Установка

В проект отчёта напрямую из GitHub:

```bash
npm install github:Magomed-cmd/gost
```

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const { createPlantUmlGost } = require("@magomed-cmd/gost/plantuml");
```

Поддерживаются CommonJS `require()` и ESM `import`, Node.js 18+.

Для разработки библиотеки:

```bash
git clone https://github.com/Magomed-cmd/gost.git
cd gost
npm ci
npm run verify
```

## Инструкция для AI: как написать готовый отчёт

Эта последовательность обязательна для Claude и других агентов, которые должны
вернуть пользователю готовый `.docx`, а не только JavaScript-код.

1. Установить пакет и использовать только публичные entrypoints
   `@magomed-cmd/gost/docx` и `@magomed-cmd/gost/plantuml`.
2. Взять [полный пример](examples/docx/full-report.cjs) за основной шаблон.
   [Минимальный пример](examples/docx/minimal.cjs) использовать только для
   быстрого старта.
3. Составить структуру и подготовить фактический текст, таблицы, формулы,
   листинги и изображения. Не выдумывать результаты расчётов и источники.
4. Создать один экземпляр `g = createDocxGost()` и отдельные счётчики рисунков
   и таблиц.
5. Собрать один плоский массив `children`. Результаты `list`, `codeBlock`,
   `codeFile`, `appendix` и `diagramBlock` добавлять через spread `...`.
6. Соблюдать порядок объектов:
   - таблица: ссылка в тексте → подпись → таблица;
   - рисунок: ссылка в тексте → изображение → подпись.
7. Выполнить `g.lint(children)`. Все `warn` исправить, а не скрывать.
8. Собрать титульную и содержательную секции, сохранить `.docx`.
9. Проверить, что файл существует, не пуст и открывается.
10. Отрендерить DOCX через Word, LibreOffice или доступный renderer и
    просмотреть все страницы. Исправить обрезание, пустые страницы, переносы и
    разрыв объекта с подписью.
11. Вернуть пользователю итоговый `.docx`, а не только исходный скрипт.

Обязательные инварианты:

- заголовки создавать через `h1/h2/h3`, чтобы их видело оглавление Word;
- ширины таблиц задавать в DXA; стандартная ширина содержимого — `9355`;
- методы, возвращающие массив, всегда добавлять через spread;
- `pageBreak()` не должен быть первым, последним или стоять сразу после заголовка;
- в готовом отчёте не должно оставаться `placeholder()`;
- авторазмер без явных `width/height` поддерживает PNG; для JPEG необходимо
  задать размеры и `imageType: "jpg"`;
- поле оглавления обновляется Word при открытии документа;
- DOCX lint проверяет структуру, но не фактическую пагинацию и не доказывает
  соответствие ГОСТ;
- Excel-документацию не нужно читать, если XLSX не входит в задачу.

Критерии готовности:

- скрипт завершился с кодом `0`;
- lint не содержит `warn`;
- DOCX создан и открывается;
- заголовки попадают в обновлённое оглавление;
- номера ссылок совпадают с подписями;
- таблицы, формулы, изображения и листинги читаемы;
- нет пустых страниц, обрезания и разрыва объектов с подписями.

## DOCX: минимальный отчёт

```js
const path = require("node:path");
const {
  createDocxGost,
  TableOfContents,
  mathFraction,
} = require("@magomed-cmd/gost/docx");

async function main() {
  const g = createDocxGost();
  const tables = g.createCaptionCounter("Таблица", { table: true });

  const children = [
    g.h1("Содержание"),
    new TableOfContents("Содержание", {
      hyperlink: false,
      headingStyleRange: "1-3",
    }),
    g.pageBreak(),
    g.h1("1 Расчётная часть"),
    g.paragraph(`Исходные данные приведены в таблице ${tables.peek()}.`),
    tables.caption("исходные данные"),
    g.makeTable([
      ["Показатель", "Значение"],
      ["Коэффициент", 3],
    ], { widths: [6000, 3355] }),
    g.formulaMath(["k = ", mathFraction(10, 3)]),
  ];

  const issues = g.lint(children);
  if (issues.some((issue) => issue.level === "warn")) {
    throw new Error("DOCX lint found warnings");
  }

  const doc = g.makeDocument([
    g.makeTitlePage({
      workType: "ОТЧЁТ",
      subtitle: "о выполнении лабораторной работы №1",
      discipline: "по дисциплине: «Архитектура ПО»",
      group: "КТбо3-7",
      author: "Иванов И. И.",
      teacher: "Петров П. П.",
      year: 2026,
    }),
    g.makeContentSection(children),
  ]);

  await g.saveDocument(doc, path.join(__dirname, "report.docx"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Конвейер:

```text
createDocxGost()
  → Paragraph/Table[]
  → lint()
  → DocxSection[]
  → makeDocument()
  → saveDocument()
```

Каждый вызов `createDocxGost()` создаёт изолированный стиль и независимые
счётчики.

## DOCX API

Основные экспорты:

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

<!-- docx-api-methods:start -->

| Метод | Возвращает |
| --- | --- |
| `run(text, opts?)` | `TextRun` |
| `paragraph(content, opts?)` | `Paragraph` |
| `centered(content, opts?)` | `Paragraph` |
| `paragraphWithMath(parts, opts?)` | `Paragraph` |
| `h1(text, opts?)` | `Paragraph` |
| `h2(text, opts?)` | `Paragraph` |
| `h3(text, opts?)` | `Paragraph` |
| `blank(opts?)` | `Paragraph` |
| `pageBreak()` | `Paragraph` |
| `caption(text, opts?)` | `Paragraph` |
| `tableCaption(text, opts?)` | `Paragraph` |
| `createCaptionCounter(prefix, opts?)` | `CaptionCounter` |
| `placeholder(label, opts?)` | `Paragraph` |
| `imageBlock(...)` | `Paragraph` |
| `codeLine(text, opts?)` | `Paragraph` |
| `codeBlock(lines, opts?)` | `Paragraph[]` |
| `codeFile(path, opts?)` | `Paragraph[]` |
| `list(items, type?, opts?)` | `Paragraph[]` |
| `appendix(letter, title, kind?)` | `Paragraph[]` |
| `formulaMath(content, opts?)` | `Paragraph` |
| `formulaInline(label, math, opts?)` | `Paragraph` |
| `makeTable(rows, opts?)` | `Table` |
| `makeTitlePage(opts)` | `DocxSection` |
| `makeContentSection(children)` | `DocxSection` |
| `makeDocument(sections, opts?)` | `Document` |
| `saveDocument(doc, path)` | `Promise<void>` |
| `diagramBlock(puml, counter, text, opts?)` | `Promise<Paragraph[]>` |
| `lint(children)` | `LintIssue[]` |

<!-- docx-api-methods:end -->

Экземпляр также содержит readonly `style: DocxStyleConfig`.

### Настройка фабрики

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

`page.margin`, `page.size` и `TABLE_CELL_MARGINS` объединяются с defaults по
полям. Alias имеет приоритет над соответствующим uppercase-полем.

Основные defaults:

| Поле | Значение |
| --- | --- |
| `FONT` | `Times New Roman` |
| `SIZE` | `28` = 14 pt |
| `SIZE_TITLE` | `32` |
| `SIZE_HEADER` | `24` |
| `SIZE_CODE` | `24` |
| `INDENT` | `709` DXA |
| `LINE` | `360` |
| `CONTENT_WIDTH` | `9355` DXA |
| `CODE_FONT` | `Courier New` |
| `TABLE_CELL_LINE` | `276` |

Страница A4: `11906 × 16838` DXA; поля: верх/низ `1134`, слева `1701`,
справа `850`.

### Общие опции текста

| Поле | Значение |
| --- | --- |
| `align` | `left`, `center`, `right`, `both` или `AlignmentType` |
| `noIndent` | убрать красную строку |
| `indent` | отступ первой строки, DXA |
| `line` | межстрочный интервал |
| `before`, `after` | интервалы до и после |
| `bold`, `italics`, `allCaps`, `underline` | оформление |
| `size` | half-points: `28` = 14 pt |
| `color`, `font` | цвет без `#`, имя шрифта |
| `keepNext`, `keepLines` | управление разрывами Word |
| `imageType` | `png`, `jpg`, `gif`, `bmp` |

`paragraph()` по умолчанию выравнивает текст по ширине, добавляет красную строку
и включает `keepLines`. `centered()` убирает отступ и центрирует.

### Текст, заголовки и списки

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();

const children = [
  g.h1("Введение"),
  g.h2("1.1 Постановка задачи"),
  g.h3("Критерий Вальда"),
  g.paragraph("Обычный абзац."),
  g.paragraph([
    "Метод ",
    { text: "Джонсона", bold: true },
    " применяется для упорядочивания работ.",
  ]),
  ...g.list(["Первый пункт", "Второй пункт"]),
  ...g.list(["Шаг 1", "Шаг 2"], "ordered"),
];

void children;
```

`h1()` переводит текст в uppercase. `h1/h2/h3` задают Word HeadingLevel,
поэтому заголовки видит `TableOfContents`. Тип списка по умолчанию — `bullet`,
также поддерживается `ordered`.

### Подписи и счётчики

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();
const figures = g.createCaptionCounter("Рисунок");
const tables = g.createCaptionCounter("Таблица", { table: true, start: 3 });

const children = [
  g.paragraph(`Схема показана на рисунке ${figures.peek()}.`),
  g.placeholder("[Здесь будет схема]"),
  figures.caption("структура системы"),
  g.paragraph(`Результаты приведены в таблице ${tables.peek()}.`),
  tables.caption("результаты эксперимента"),
];

void children;
```

`peek()` возвращает текущий номер, не увеличивая его. `caption()` создаёт
подпись и увеличивает счётчик. Для таблиц обязателен `{ table: true }`.

Если асинхронный `diagramBlock()` создаётся заранее, сохраните номер до вызова:

```js
const expectedNumber = figures.peek();
const diagramChildrenPromise = g.diagramBlock(source, figures, "архитектура");
void expectedNumber;
void diagramChildrenPromise;
```

### Код и приложения

```js
const path = require("node:path");
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();

const children = [
  g.codeLine("npm run build"),
  ...g.codeBlock([
    "function sum(a, b) {",
    "  return a + b;",
    "}",
  ], { size: 20 }),
  ...g.codeFile(path.join(__dirname, "program.js"), { size: 20 }),
  ...g.appendix("А", "Исходный код"),
  ...g.appendix("Б", "Схема базы данных", "обязательное"),
];

void children;
```

`codeFile()` читает UTF-8, нормализует CRLF, заменяет tab двумя пробелами и не
создаёт пустой абзац из финального перевода строки. `appendix()` возвращает
массив и принимает вид `"обязательное"` или `"справочное"`.

### Таблицы

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();

const table = g.makeTable([
  ["Критерий", "Значение"],
  ["MM", 12],
  [{ text: "Итого", bold: true }, { text: 12, bold: true }],
], {
  widths: [6000, 3355],
  headerRow: 0,
  centerHeader: true,
});

void table;
```

Значение ячейки:

- строка или число;
- descriptor `{ text, align, bold, italics, size, color, font, colspan,
  rowspan, shading }`;
- math-компонент;
- массив текстовых и math-фрагментов в `descriptor.text`.

| Опция | Смысл |
| --- | --- |
| `widths` | ширины колонок в DXA |
| `headerRow` | индекс строки-заголовка, default `0` |
| `align` | выравнивание обычных ячеек |
| `centerHeader` | центрировать заголовок, default `true` |
| `fontSize` | размер текста |
| `cellLine` | межстрочный интервал |
| `contentWidth` | общая ширина вместо `style.CONTENT_WIDTH` |
| `borders` | объект границ `docx` |

Если `widths` не передан, ширина делится поровну. Переданный массив должен
соответствовать фактическому числу колонок.

### Формулы Office Math

```js
const {
  createDocxGost,
  mathFraction,
  mathSub,
  mathSubSup,
  mathSum,
} = require("@magomed-cmd/gost/docx");

const g = createDocxGost();
const children = [
  g.paragraphWithMath([
    "Оптимальное значение ",
    mathSub("V", "max"),
    " найдено аналитически.",
  ]),
  g.formulaMath(["ν = ", mathFraction(48, 13), " ≈ 3.692"]),
  g.formulaInline("Получаем:", [
    mathSum(mathSub("x", "i"), {
      subScript: "i=1",
      superScript: "n",
    }),
    " = 1",
  ]),
  g.formulaMath([mathSubSup("x", "i", "*"), " = 0"]),
];

void children;
```

| Функция | Результат |
| --- | --- |
| `mathExpr(...parts)` | выражение |
| `mathFraction(num, den)` | дробь |
| `mathSub(base, sub)` | нижний индекс |
| `mathSup(base, sup)` | верхний индекс |
| `mathSubSup(base, sub, sup)` | оба индекса |
| `mathParen(...parts)` | круглые скобки |
| `mathBracket(...parts)` | квадратные скобки |
| `mathBrace(...parts)` | фигурные скобки |
| `mathRoot(content, degree?)` | корень |
| `mathSum(content, opts?)` | сумма с пределами |
| `mathIntegral(content, opts?)` | интеграл с пределами |

Используйте эти функции для индексов, дробей, степеней и операторов: Word
сохранит результат как Office Math, а не обычный текст.

### Изображения

Явные размеры задаются в display px Word: `96 px = 1 inch`.

```js
const fs = require("node:fs");
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();

const image = g.imageBlock(
  fs.readFileSync("photo.jpg"),
  400,
  300,
  { imageType: "jpg" },
);

void image;
```

Авторазмер работает для PNG:

```js
const fs = require("node:fs");
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();
const png = fs.readFileSync("diagram.png");

const natural = g.imageBlock(png);
const limited = g.imageBlock(png, {
  maxWidth: 500,
  fit: "natural",
  sourceDpi: 144,
});

void natural;
void limited;
```

Формула natural size:

```text
displayWidth  = rasterWidth  × 96 / sourceDpi
displayHeight = rasterHeight × 96 / sourceDpi
```

Default `sourceDpi` — `96`. Default `maxWidth` вычисляется из
`style.CONTENT_WIDTH`; для стандартного стиля это примерно `624` display px.
`fit: "natural"` сохраняет естественный размер и только уменьшает слишком
широкое изображение. `fit: "content"` заполняет доступную ширину.

### PlantUML внутри DOCX

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const { createPlantUmlGost } = require("@magomed-cmd/gost/plantuml");

async function buildDiagramChildren() {
  const g = createDocxGost();
  const p = createPlantUmlGost();
  const figures = g.createCaptionCounter("Рисунок");
  const source = p.classDiagram()
    .interface("Repository", ["+ save(): void"])
    .class("SqlRepository")
    .implements("SqlRepository", "Repository")
    .build();

  return [
    g.paragraph(`Структура показана на рисунке ${figures.peek()}.`),
    ...await g.diagramBlock(source, figures, "структура классов"),
  ];
}

void buildDiagramChildren;
```

`diagramBlock()` рендерит PNG, вычисляет размер и возвращает
`[imageBlock, caption]`.

| Опция | Default | Смысл |
| --- | --- | --- |
| `dpi` | `150` | качество исходного PNG |
| `maxWidth` | из ширины документа | максимальная display-ширина |
| `fit` | `natural` | natural size с ограничением |
| `skinparams` | `{}` | дополнительные параметры PlantUML |

DPI повышает детализацию растра, но не физическую ширину в Word. При высоте
результата больше `900 px` библиотека выводит предупреждение.

Рендер PlantUML требует Java в `PATH`:

```bash
java -version
```

Без Java можно заранее получить PNG другим способом и вставить его через
`imageBlock()`.

### Титульный лист, секции и сохранение

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();

const title = g.makeTitlePage({
  workType: "ОТЧЁТ",
  subtitle: [
    "о выполнении лабораторной работы №4",
    "на тему: «Пример»",
  ],
  discipline: "по дисциплине: «Архитектура ПО»",
  group: "КТбо3-7",
  author: "Иванов И. И.",
  teacher: "Петров П. П.",
  teacherTitle: "Доцент кафедры",
  year: 2026,
});

void title;
```

Обязательные поля: `workType`, `discipline`, `group`, `author`, `teacher`,
`year`. `subtitle` — строка или массив. Default `teacherTitle` —
`Доцент кафедры`.

Шаблон выводит Министерство науки и высшего образования РФ, ЮФУ,
Инженерно-технологическую академию, ИКТИБ и `Таганрог {year}`.

`makeContentSection()` задаёт A4 и номер страницы в нижнем колонтитуле.
`makeDocument()` подключает heading styles, numbering для `list()` и
`settings.updateFields = true`. `makeDocument(sections, { styles })` позволяет
целиком заменить styles.

### DOCX lint

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();
const children = [g.h1("Введение"), g.paragraph("Текст.")];
const issues = g.lint(children);

if (issues.some((issue) => issue.level === "warn")) {
  process.exitCode = 1;
}
```

| Код | Level | Проверка |
| --- | --- | --- |
| `empty-page-start` | warn | `pageBreak` первым |
| `empty-page-end` | warn | `pageBreak` последним |
| `consecutive-page-breaks` | warn | два `pageBreak` подряд |
| `page-break-blank-page-break` | warn | разрыв, blanks, разрыв |
| `heading-before-page-break` | warn | heading прямо перед разрывом |
| `image-caption-split` | warn | после image следующим значимым идёт разрыв |
| `table-caption-split` | warn | после tableCaption следующим значимым идёт разрыв |
| `image-without-caption` | warn | сразу после image нет caption |
| `placeholder-left` | warn | остался placeholder |
| `blank-before-page-break` | info | blank прямо перед разрывом |
| `too-many-blanks` | info | три и более blanks подряд |

Lint не запускает Word, не знает реальную пагинацию, не проверяет визуальную
геометрию, не анализирует произвольные элементы `docx` и не является
сертификатором ГОСТ.

## PlantUML

Модуль строит PlantUML-текст и рендерит его в `Buffer`. Сборка source через
`.build()` не требует Java; `render()` и DOCX `diagramBlock()` требуют Java.

```js
const fs = require("node:fs");
const { createPlantUmlGost } = require("@magomed-cmd/gost/plantuml");

async function main() {
  const p = createPlantUmlGost({ dpi: 150 });
  const source = p.classDiagram()
    .interface("Repository", ["+ save(): void"])
    .class("SqlRepository")
    .implements("SqlRepository", "Repository")
    .build();

  const png = await p.render(source);
  await fs.promises.writeFile("classes.png", png);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### PlantUML API

<!-- plantuml-api-methods:start -->

| Метод | Результат |
| --- | --- |
| `useCaseDiagram()` | `UseCaseBuilder` |
| `classDiagram()` | `ClassDiagramBuilder` |
| `sequenceDiagram()` | `SequenceBuilder` |
| `stateDiagram()` | `StateBuilder` |
| `activityDiagram()` | `ActivityBuilder` |
| `componentDiagram()` | `ComponentBuilder` |
| `deploymentDiagram()` | `DeploymentBuilder` |
| `objectDiagram()` | `ObjectBuilder` |
| `erDiagram()` | `ERBuilder` |
| `timingDiagram()` | `TimingBuilder` |
| `mindMap()` | `MindMapBuilder` |
| `ganttChart()` | `GanttBuilder` |
| `render(source, options?)` | `Promise<Buffer>` |
| `autoImageSize(png, maxWidth?, sourceDpi?, fit?)` | `{ width, height }` |

<!-- plantuml-api-methods:end -->

Все builders поддерживают:

| Метод | Назначение |
| --- | --- |
| `add(line)` | добавить произвольную строку PlantUML |
| `blank()` | добавить пустую строку |
| `build()` | собрать готовый source |

Обычные builders создают `@startuml ... @enduml`. Mind map и Gantt используют
собственные теги.

### Методы 12 builders

#### Use case

```text
actor(name, alias?)
usecase(name, alias?)
arrow(from, to, label?)
extend(base, extension)
include(base, included)
package(name, callback)
```

#### Class

```text
class(name, members?)
abstract(name, members?)
interface(name, members?)
enum(name, values)
extends(child, parent)
implements(className, interfaceName)
association(from, to, label?)
dependency(from, to, label?)
composition(from, to, label?)
aggregation(from, to, label?)
package(name, callback)
```

`build()` автоматически добавляет `hide circle`.

#### Sequence

```text
participant(name, alias?)
actor(name, alias?)
arrow(from, to, label)
return(from, to, label)
activate(name)
deactivate(name)
note(text, "left" | "right", target)
divider(text?)
group(label, callback)
```

#### State

```text
state(name, label?)
transition(from, to, label?, direction?)
initial(to)
final(from)
```

`direction`: `down`, `up`, `left` или `right`.

#### Activity

```text
start()
stop()
end()
action(text)
note(text, side?)
if(condition, yesCallback, noCallback?, yesLabel?, noLabel?)
while(condition, callback, exitLabel?)
fork(...branchCallbacks)
partition(name, callback)
```

#### Component

```text
component(name, alias?)
interface(name, alias?)
database(name, alias?)
cloud(name, alias?)
arrow(from, to, label?)
link(from, to, label?)
package(name, callback)
```

#### Deployment

```text
node(name, alias?, callback?)
component(name, alias?)
database(name, alias?)
artifact(name, alias?)
cloud(name, callback?)
arrow(from, to, label?)
link(from, to, label?)
```

#### Object

```text
object(name, alias?, fields?)
link(from, to, label?)
```

`fields` — `Record<string, string | number>`. Для имён со спецсимволами задайте
alias и используйте его в связях.

#### ER

```text
entity(name, primaryKeyFields, fields?)
relation(from, relation, to, label?)
```

Отношения: `ER.ONE_TO_ONE`, `ER.ONE_TO_MANY`, `ER.ONE_TO_MANY_REQ`,
`ER.OPT_TO_MANY`, `ER.MANY_TO_MANY`.

#### Timing

```text
concise(name, alias?)
robust(name, alias?)
clock(name, period)
at(time)
state(participant, value)
arrow(from, to, label)
highlight(fromTime, toTime, color?, label?)
```

#### Mind map

```text
node(level, text, side?)
```

`side` — `right` по умолчанию или `left`.

#### Gantt

```text
startDate("YYYY-MM-DD")
task(name, durationDays)
after(name, afterTaskName, durationDays)
milestone(name, afterTaskName)
section(name)
```

### Рендер и sizing

```text
render(source, {
  format?: "png" | "svg",
  dpi?: number,
  skinparams?: Record<string, string>,
}): Promise<Buffer>
```

Фабричный DPI используется по умолчанию; опция отдельного `render()` имеет
приоритет. Низкоуровневый эквивалент — `renderDiagram(source, options?)`.

```text
autoImageSize(
  png: Buffer,
  maxWidth?: number,
  sourceDpi?: number,
  fit?: "natural" | "content",
): { width: number; height: number }
```

Результат выражен в DOCX display px. `natural` сохраняет физический размер и
ограничивает ширину, `content` заполняет `maxWidth`. Буфер не ресемплируется.
Instance-метод по умолчанию использует DPI фабрики.

Runtime-экспорты PlantUML:

```text
createPlantUmlGost, DiagramBuilder, UseCaseBuilder, ClassDiagramBuilder,
SequenceBuilder, StateBuilder, ActivityBuilder, ComponentBuilder,
DeploymentBuilder, ObjectBuilder, ERBuilder, TimingBuilder, MindMapBuilder,
GanttBuilder, ER, renderDiagram, wrapWithSkin, autoImageSize
```

Исполняемый smoke-пример всех builders:

```bash
npm run example:plantuml
```

## Excel

Excel намеренно вынесен из основного README:

- [быстрый старт](docs/excel/quickstart.md);
- [полный API и autofit](docs/excel/api.md).

## Проверка библиотеки

```bash
npm run verify
npm run check:package
```

`verify` собирает проект, запускает 155 тестов, проверяет публичные типы,
Markdown, соответствие API документации и синтаксис примеров. `check:package`
устанавливает реальный tarball и проверяет CommonJS, ESM, TypeScript, DOCX,
XLSX и построение PlantUML source.
