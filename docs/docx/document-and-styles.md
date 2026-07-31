# DOCX: документ и стили

## Титульный лист

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
`year`. `subtitle` — строка или массив строк. Default `teacherTitle` —
`Доцент кафедры`.

Текущий шаблон неизменно выводит:

- Министерство науки и высшего образования РФ;
- ЮЖНЫЙ ФЕДЕРАЛЬНЫЙ УНИВЕРСИТЕТ;
- Инженерно-технологическую академию;
- ИКТИБ;
- `Таганрог {year}`.

Организация и город не являются опциями.

## Секции, оглавление и сохранение

```js
const path = require("node:path");
const {
  createDocxGost,
  TableOfContents,
} = require("@magomed-cmd/gost/docx");

async function main() {
  const g = createDocxGost();
  const children = [
    g.h1("Содержание"),
    new TableOfContents("Содержание", {
      hyperlink: false,
      headingStyleRange: "1-3",
    }),
    g.pageBreak(),
    g.h1("Введение"),
    g.paragraph("Текст."),
  ];

  const content = g.makeContentSection(children);
  const doc = g.makeDocument([content]);
  await g.saveDocument(doc, path.join(__dirname, "report.docx"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

`makeContentSection()` добавляет A4-параметры страницы и номер в нижнем
колонтитуле. `makeDocument()` всегда подключает heading styles, numbering для
`list()` и `settings.updateFields = true`.

Word обновляет `TableOfContents` при открытии документа.

`makeDocument(sections, { styles })` позволяет целиком заменить объект styles.

## Настройка экземпляра

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");

const g = createDocxGost({
  style: {
    font: "Arial",
    size: 24,
    sizeCode: 20,
    line: 360,
    contentWidth: 9000,
    page: {
      margin: { left: 1800 },
    },
  },
});

void g;
```

Aliases:

| Alias | Поле стиля |
| --- | --- |
| `font` | `FONT` |
| `size` | `SIZE` |
| `sizeTitle` | `SIZE_TITLE` |
| `sizeHeader` | `SIZE_HEADER` |
| `sizeCode` | `SIZE_CODE` |
| `indent` | `INDENT` |
| `line` | `LINE` |
| `contentWidth` | `CONTENT_WIDTH` |
| `codeFont` | `CODE_FONT` |
| `page` | `PAGE` |

Uppercase-поля также принимаются. Alias имеет приоритет над uppercase-полем.

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

Страница: A4 `11906 × 16838` DXA; поля: верх/низ `1134`, слева `1701`,
справа `850`.

`page.size`, `page.margin` и `TABLE_CELL_MARGINS` принимают частичные вложенные
объекты и объединяются с defaults. Объекты границ и tab stops клонируются для
каждого экземпляра, поэтому изменение `g.style` не меняет другие экземпляры.
