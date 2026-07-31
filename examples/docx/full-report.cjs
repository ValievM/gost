const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const {
  createDocxGost,
  TableOfContents,
  mathFraction,
  mathSub,
} = require("../../dist/docx-gost");
const { createPlantUmlGost } = require("../../dist/plantuml-gost");

function assertJavaAvailable() {
  const probe = spawnSync("java", ["-version"], { stdio: "ignore" });
  if (probe.error || probe.status !== 0) {
    throw new Error(
      "Для diagramBlock требуется Java. Установите Java либо заранее "
      + "отрендерите диаграмму в PNG и вставьте её через imageBlock().",
    );
  }
}

async function main() {
  assertJavaAvailable();

  const g = createDocxGost();
  const plantUml = createPlantUmlGost({ dpi: 150 });
  const figures = g.createCaptionCounter("Рисунок");
  const tables = g.createCaptionCounter("Таблица", { table: true });

  const architecture = plantUml.componentDiagram()
    .package("Клиент", (b) => b.component("Web UI", "UI"))
    .package("Сервер", (b) => {
      b.component("REST API", "API");
      b.component("Сервис отчётов", "REPORTS");
      b.database("PostgreSQL", "DB");
    })
    .arrow("UI", "API", "HTTPS")
    .arrow("API", "REPORTS", "создать отчёт")
    .arrow("REPORTS", "DB", "SQL")
    .build();

  const architectureFigureNumber = figures.peek();
  const diagram = await g.diagramBlock(
    architecture,
    figures,
    "компонентная архитектура системы",
    { dpi: 150, fit: "natural" },
  );

  const children = [
    g.h1("Содержание"),
    new TableOfContents("Содержание", {
      hyperlink: false,
      headingStyleRange: "1-3",
    }),
    g.pageBreak(),

    g.h1("1 Введение"),
    g.paragraph(
      "Цель работы — спроектировать сервис генерации учебных отчётов "
      + "и проверить его основные архитектурные решения.",
    ),
    g.paragraph("Для достижения цели необходимо:"),
    ...g.list([
      "описать исходные требования;",
      "выделить компоненты системы;",
      "оценить расчётную производительность;",
      "подготовить пример реализации.",
    ]),

    g.h1("2 Исходные данные и расчёт"),
    g.paragraph(
      `Параметры расчёта приведены в таблице ${tables.peek()}.`,
    ),
    tables.caption("исходные параметры сервиса"),
    g.makeTable([
      ["Показатель", "Обозначение", "Значение"],
      ["Количество запросов", "N", "1200 запросов"],
      ["Интервал наблюдения", "t", "60 мин"],
      ["Средняя интенсивность", "λ", "20 запросов/мин"],
    ], {
      widths: [4400, 2200, 2755],
      headerRow: 0,
      centerHeader: true,
    }),
    g.paragraphWithMath([
      "Средняя интенсивность ",
      mathSub("λ", "avg"),
      " определяется отношением количества запросов к интервалу наблюдения:",
    ]),
    g.formulaMath([
      mathSub("λ", "avg"),
      " = ",
      mathFraction("N", "t"),
      " = ",
      mathFraction(1200, 60),
      " = 20 запросов/мин.",
    ]),
    g.pageBreak(),

    g.h1("3 Архитектура системы"),
    g.paragraph(
      `Компоненты и основные связи показаны на рисунке ${architectureFigureNumber}.`,
    ),
    ...diagram,
    g.paragraph(
      "Пользовательский интерфейс обращается к REST API. Сервис отчётов "
      + "формирует документы и получает исходные данные из базы данных.",
    ),
    g.pageBreak(),

    g.h1("4 Реализация"),
    g.paragraph("Минимальная функция формирования содержательной секции:"),
    ...g.codeBlock([
      "function createSection(g, title, text) {",
      "  return g.makeContentSection([",
      "    g.h1(title),",
      "    g.paragraph(text),",
      "  ]);",
      "}",
    ]),

    g.h1("5 Заключение"),
    g.paragraph(
      "В работе определена компонентная структура сервиса, рассчитана "
      + "средняя интенсивность запросов и подготовлен пример реализации.",
    ),
    g.pageBreak(),

    ...g.appendix("А", "Пример конфигурации отчёта", "справочное"),
    ...g.codeBlock([
      "const report = {",
      "  format: \"docx\",",
      "  locale: \"ru-RU\",",
      "  includeTableOfContents: true,",
      "};",
    ]),
  ];

  const issues = g.lint(children);
  const warnings = issues.filter((issue) => issue.level === "warn");
  if (warnings.length > 0) {
    throw new Error(`DOCX lint: ${warnings.length} предупреждений.`);
  }

  const doc = g.makeDocument([
    g.makeTitlePage({
      workType: "ОТЧЁТ",
      subtitle: [
        "о выполнении лабораторной работы №1",
        "на тему: «Проектирование сервиса отчётов»",
      ],
      discipline: "по дисциплине: «Архитектура программных систем»",
      group: "КТбо3-7",
      author: "Иванов И. И.",
      teacher: "Петров П. П.",
      year: 2026,
    }),
    g.makeContentSection(children),
  ]);

  const outputPath = path.join(
    __dirname,
    "..",
    "out",
    "docx-full-report.docx",
  );
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await g.saveDocument(doc, outputPath);

  const { size } = await fs.promises.stat(outputPath);
  if (size === 0) throw new Error("Создан пустой DOCX.");
  console.log(`Создан ${outputPath} (${size} байт)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
