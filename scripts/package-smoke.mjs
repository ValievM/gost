import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoot = mkdtempSync(join(tmpdir(), "gost-package-smoke-"));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const node = process.execPath;

function run(command, args, cwd = temporaryRoot) {
  execFileSync(command, args, {
    cwd,
    env: process.env,
    stdio: "inherit",
  });
}

try {
  run(npm, ["pack", "--pack-destination", temporaryRoot], packageRoot);

  const archives = readdirSync(temporaryRoot).filter((name) => name.endsWith(".tgz"));
  assert.equal(archives.length, 1, "npm pack должен создать ровно один архив");
  const archive = join(temporaryRoot, archives[0]);

  writeFileSync(
    join(temporaryRoot, "package.json"),
    JSON.stringify({ private: true }, null, 2),
  );
  run(npm, [
    "install",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    archive,
  ]);

  writeFileSync(
    join(temporaryRoot, "consumer.cjs"),
    [
      'const assert = require("node:assert/strict");',
      'const fs = require("node:fs");',
      'const ExcelJS = require("exceljs");',
      'const docx = require("@magomed-cmd/gost/docx");',
      'const excel = require("@magomed-cmd/gost/excel");',
      'const plantuml = require("@magomed-cmd/gost/plantuml");',
      "(async () => {",
      '  assert.equal(typeof docx.createDocxGost, "function");',
      '  assert.equal(typeof excel.createExcelGost, "function");',
      '  assert.equal(typeof plantuml.createPlantUmlGost, "function");',
      "  const documentGost = docx.createDocxGost();",
      '  const children = [documentGost.h1("Smoke"), documentGost.paragraph("Проверка DOCX")];',
      "  const document = documentGost.makeDocument([documentGost.makeContentSection(children)]);",
      '  await documentGost.saveDocument(document, "smoke.docx");',
      '  const docxBuffer = fs.readFileSync("smoke.docx");',
      '  assert.ok(docxBuffer.length > 0, "должен быть создан непустой DOCX");',
      '  assert.equal(docxBuffer.subarray(0, 2).toString(), "PK", "DOCX должен быть ZIP-архивом");',
      "  const puml = plantuml.createPlantUmlGost().sequenceDiagram()",
      '    .participant("Клиент", "CLIENT")',
      '    .participant("Сервер", "SERVER")',
      '    .arrow("CLIENT", "SERVER", "запрос")',
      "    .build();",
      '  assert.match(puml, /^@startuml\\n/);',
      '  assert.match(puml, /CLIENT -> SERVER : запрос/);',
      '  assert.match(puml, /\\n@enduml$/);',
      "  const workbook = new ExcelJS.Workbook();",
      '  const sheet = workbook.addWorksheet("Smoke");',
      "  const gost = excel.createExcelGost();",
      '  gost.setValue(sheet, "A1", "Проверка", gost.HEADER_STYLE);',
      '  gost.setValue(sheet, "A2", 42);',
      "  gost.autoFitSheet(sheet);",
      "  const buffer = await workbook.xlsx.writeBuffer();",
      '  assert.ok(buffer.length > 0, "ExcelJS должен собрать непустой XLSX");',
      "})().catch((error) => {",
      "  console.error(error);",
      "  process.exitCode = 1;",
      "});",
      "",
    ].join("\n"),
  );
  run(node, ["consumer.cjs"]);

  writeFileSync(
    join(temporaryRoot, "consumer.mjs"),
    [
      'import assert from "node:assert/strict";',
      'import { createDocxGost } from "@magomed-cmd/gost/docx";',
      'import { createExcelGost } from "@magomed-cmd/gost/excel";',
      'import { createPlantUmlGost } from "@magomed-cmd/gost/plantuml";',
      'assert.equal(typeof createDocxGost, "function");',
      'assert.equal(typeof createExcelGost, "function");',
      'assert.equal(typeof createPlantUmlGost, "function");',
      "",
    ].join("\n"),
  );
  run(node, ["consumer.mjs"]);

  writeFileSync(
    join(temporaryRoot, "consumer.mts"),
    [
      'import { createDocxGost } from "@magomed-cmd/gost/docx";',
      'import { createExcelGost } from "@magomed-cmd/gost/excel";',
      'import { createPlantUmlGost } from "@magomed-cmd/gost/plantuml";',
      "createDocxGost();",
      "createExcelGost();",
      "createPlantUmlGost();",
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(temporaryRoot, "consumer.cts"),
    [
      'import { createDocxGost } from "@magomed-cmd/gost/docx";',
      'import { createExcelGost } from "@magomed-cmd/gost/excel";',
      'import { createPlantUmlGost } from "@magomed-cmd/gost/plantuml";',
      "createDocxGost();",
      "createExcelGost();",
      "createPlantUmlGost();",
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(temporaryRoot, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          module: "NodeNext",
          moduleResolution: "NodeNext",
          noEmit: true,
          strict: true,
          skipLibCheck: false,
        },
        files: ["consumer.mts", "consumer.cts"],
      },
      null,
      2,
    ),
  );
  const tsc = join(packageRoot, "node_modules", "typescript", "bin", "tsc");
  run(node, [tsc, "--project", "tsconfig.json"]);

  console.log("Package smoke: CJS, ESM и TypeScript — OK");
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
