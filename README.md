# @magomed-cmd/gost

Генератор учебных отчётов ИТА ЮФУ в Таганроге:

- DOCX: титульный лист, разделы, таблицы, формулы, рисунки, листинги и приложения;
- PlantUML: 12 программных builders и PNG-рендер;
- Excel: оформление расчётных книг.

`makeTitlePage()` рассчитан именно на ИТА ЮФУ: название организации и город
зашиты в текущий шаблон. Для другого учебного заведения нужен отдельный шаблон.

Если отчёт генерирует AI: [маршрут и критерии готовности](docs/ai-report-generation.md).

## Установка

В проект отчёта напрямую из GitHub:

```bash
npm install github:Magomed-cmd/gost
```

Для разработки библиотеки:

```bash
git clone https://github.com/Magomed-cmd/gost.git
cd gost
npm ci
npm run verify
```

Подключение собранной локальной копии в соседний проект:

```bash
npm install ../gost
```

Публичные entrypoints:

```js
const { createDocxGost } = require("@magomed-cmd/gost/docx");
const { createPlantUmlGost } = require("@magomed-cmd/gost/plantuml");
```

Поддерживаются `require()` и ESM `import`; Node.js 18+.

## DOCX: рабочий минимум

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

  g.lint(children);

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

Файл без внешних ресурсов: [examples/docx/minimal.cjs](examples/docx/minimal.cjs).
Полный эталон с таблицей, формулой, PlantUML, кодом и приложением:
[examples/docx/full-report.cjs](examples/docx/full-report.cjs). Для его запуска
нужна Java.

Логическая цепочка DOCX:

1. `createDocxGost()` создаёт изолированный экземпляр со стилем.
2. Методы `g.*` создают элементы массива `children`.
3. `g.lint(children)` выполняет структурный preflight.
4. `makeTitlePage()` и `makeContentSection()` создают секции.
5. `makeDocument()` собирает документ, `saveDocument()` записывает файл.

Ключевые группы API:

| Задача | Методы |
| --- | --- |
| Текст | `paragraph`, `centered`, `run` |
| Структура | `h1`, `h2`, `h3`, `list`, `appendix`, `pageBreak` |
| Подписи | `createCaptionCounter`, `caption`, `tableCaption` |
| Таблицы и формулы | `makeTable`, `formulaMath`, `formulaInline`, `paragraphWithMath` |
| Рисунки | `imageBlock`, `placeholder`, `diagramBlock` |
| Код | `codeLine`, `codeBlock`, `codeFile` |
| Документ | `makeTitlePage`, `makeContentSection`, `makeDocument`, `saveDocument` |

Полная DOCX-документация: [docs/docx/README.md](docs/docx/README.md).

## PlantUML: кратко

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

Доступные builders:

| Метод | Диаграмма | Метод | Диаграмма |
| --- | --- | --- | --- |
| `useCaseDiagram()` | прецедентов | `classDiagram()` | классов |
| `sequenceDiagram()` | последовательности | `stateDiagram()` | состояний |
| `activityDiagram()` | деятельности | `componentDiagram()` | компонентов |
| `deploymentDiagram()` | развёртывания | `objectDiagram()` | объектов |
| `erDiagram()` | ER-модель | `timingDiagram()` | временная |
| `mindMap()` | интеллект-карта | `ganttChart()` | Гант |

Рендер требует Java. Подробности:
[быстрый старт PlantUML](docs/plantuml/quickstart.md).

## Документация

- [Карта документации](docs/INDEX.md)
- [Генерация DOCX с AI](docs/ai-report-generation.md)
- [DOCX](docs/docx/README.md)
- [PlantUML](docs/plantuml/quickstart.md)
- [Excel](docs/excel/quickstart.md)
- [Правила для AI-агентов](AGENTS.md)
- [Маршрут для Claude](CLAUDE.md)

## Проверка

```bash
npm run verify
npm run check:package
```

Линтер DOCX — структурный preflight, а не проверка фактической пагинации Word
и не сертификатор ГОСТ.
