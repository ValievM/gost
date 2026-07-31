const path = require("node:path");
const fs = require("node:fs");
const {
  createDocxGost,
  TableOfContents,
  mathFraction,
} = require("../../dist/docx-gost");

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

  const outputPath = path.join(__dirname, "..", "out", "docx-minimal.docx");
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await g.saveDocument(doc, outputPath);
  console.log(`Создан ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
