# DOCX: модель использования

Публичный импорт:

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");
```

Фабрика создаёт экземпляр `g` с единым стилем. Экземпляры не разделяют
вложенные объекты стиля и счётчики.

## Конвейер

```text
createDocxGost
  → Paragraph/Table[]
  → lint
  → DocxSection[]
  → Document
  → saveDocument
```

```js
const path = require("node:path");
const { createDocxGost } = require("@magomed-cmd/gost/docx");

async function main() {
  const g = createDocxGost();
  const children = [
    g.h1("Введение"),
    g.paragraph("Текст отчёта."),
  ];

  g.lint(children);

  const doc = g.makeDocument([
    g.makeTitlePage({
      workType: "ОТЧЁТ",
      discipline: "по дисциплине: «Программная инженерия»",
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

## Инварианты

- Заголовки создаются через `h1/h2/h3`, чтобы Word видел уровни структуры.
- Таблица: ссылка в тексте → подпись над таблицей → `makeTable()`.
- Рисунок: ссылка в тексте → `imageBlock()` → подпись под рисунком.
- Методы, возвращающие массив (`list`, `codeBlock`, `codeFile`, `appendix`,
  `diagramBlock`), добавляются через spread.
- `g.lint()` вызывается до `makeDocument()`.
- `makeTitlePage()` предназначен для ИТА ЮФУ в Таганроге.

## Выберите тему

- [Полный API](api.md)
- [Текст, заголовки, списки, код, приложения](content.md)
- [Таблицы и математика](tables-and-math.md)
- [Изображения и диаграммы](images-and-diagrams.md)
- [Документ и стили](document-and-styles.md)
- [Lint](lint.md)

Запускаемый пример: [examples/docx/minimal.cjs](../../examples/docx/minimal.cjs).
