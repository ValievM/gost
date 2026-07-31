# DOCX: контент

Все примеры предполагают:

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const g = createDocxGost();
```

## Абзацы и runs

```js
const children = [
  g.paragraph("Обычный абзац."),
  g.paragraph("Без красной строки.", { noIndent: true }),
  g.centered("РЕФЕРАТ", { bold: true }),
  g.paragraph([
    "Метод ",
    { text: "Джонсона", bold: true },
    " применяется для упорядочивания работ.",
  ]),
];

const run = g.run("низкоуровневый TextRun", { italics: true });
void run;
```

`paragraph()` по умолчанию: выравнивание по ширине, красная строка,
`keepLines: true`. `centered()` убирает отступ и центрирует.

## Заголовки и разрывы

```js
const children = [
  g.h1("Введение"),
  g.h2("1.1 Постановка задачи"),
  g.h3("Критерий Вальда"),
  g.blank({ line: 240 }),
  g.pageBreak(),
];
```

`h1()` переводит текст в uppercase. Все три метода выставляют Word
`HeadingLevel`, поэтому заголовки видит `TableOfContents`.

## Списки

```js
const children = [
  ...g.list(["Первый пункт", "Второй пункт"]),
  ...g.list(["Шаг 1", "Шаг 2"], "ordered"),
];
```

Тип по умолчанию — `bullet`, маркер — тире. Допустимые типы: `bullet`,
`ordered`. Нумерация подключается внутри `makeDocument()`.

## Подписи и счётчики

```js
const figures = g.createCaptionCounter("Рисунок");
const tables = g.createCaptionCounter("Таблица", {
  table: true,
  start: 3,
});

const children = [
  g.paragraph(`Схема показана на рисунке ${figures.peek()}.`),
  g.placeholder("[Здесь будет схема]"),
  figures.caption("структура системы"),

  g.paragraph(`Результаты приведены в таблице ${tables.peek()}.`),
  tables.caption("результаты эксперимента"),
];
```

`peek()` не меняет номер; `caption()` создаёт подпись и увеличивает его.
Для таблиц обязателен `table: true`: подпись должна быть слева и над таблицей.
Без счётчика доступны `g.caption()` и `g.tableCaption()`.

## Код

```js
const path = require("node:path");

const children = [
  g.codeLine("npm run build"),
  ...g.codeBlock([
    "function sum(a, b) {",
    "  return a + b;",
    "}",
  ], { size: 20 }),
  ...g.codeFile(path.join(__dirname, "program.js"), { size: 20 }),
];
```

`codeFile()` синхронно читает UTF-8, переводит CRLF в LF, заменяет tab двумя
пробелами и не создаёт лишний абзац из финального перевода строки.

## Приложения

```js
const children = [
  ...g.appendix("А", "Исходный код"),
  ...g.appendix("Б", "Схема базы данных", "обязательное"),
  ...g.appendix("В", "Дополнительные расчёты", "справочное"),
];
```

Результат содержит:

1. `ПРИЛОЖЕНИЕ {БУКВА}` как Heading 1;
2. опционально `(обязательное)` или `(справочное)`;
3. название приложения.

Метод возвращает массив: нужен spread.
