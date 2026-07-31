import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const require = createRequire(import.meta.url);

const contracts = [
  {
    name: "DOCX",
    source: "src/docx/types.ts",
    interfaceName: "DocxGostInstance",
    docs: "docs/docx/api.md",
    entrypoint: "dist/docx-gost.js",
    factory: "createDocxGost",
  },
  {
    name: "PlantUML",
    source: "src/plantuml-gost.ts",
    interfaceName: "PlantUmlGostInstance",
    docs: "docs/plantuml/api.md",
    entrypoint: "dist/plantuml-gost.js",
    factory: "createPlantUmlGost",
  },
  {
    name: "Excel",
    source: "src/excel/types.ts",
    interfaceName: "ExcelGostInstance",
    docs: "docs/excel/api.md",
    entrypoint: "dist/excel-gost.js",
    factory: "createExcelGost",
  },
];

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function interfaceMethods(contract) {
  const sourceText = read(contract.source);
  const sourceFile = ts.createSourceFile(
    contract.source,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const declaration = sourceFile.statements.find(
    (node) => ts.isInterfaceDeclaration(node) && node.name.text === contract.interfaceName,
  );
  if (!declaration) {
    throw new Error(`${contract.name}: interface ${contract.interfaceName} not found`);
  }
  return new Set(
    declaration.members
      .filter(ts.isMethodSignature)
      .map((member) => member.name.getText(sourceFile).replace(/^["']|["']$/g, "")),
  );
}

function documentedMethods(contract) {
  const docs = read(contract.docs);
  const startMarker = "<!-- api-methods:start -->";
  const endMarker = "<!-- api-methods:end -->";
  const start = docs.indexOf(startMarker);
  const end = docs.indexOf(endMarker);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`${contract.name}: API method markers not found in ${contract.docs}`);
  }
  const block = docs.slice(start + startMarker.length, end);
  const matches = [...block.matchAll(/^\|\s*`([A-Za-z_$][\w$]*)\([^`]*\)`\s*\|/gm)];
  return new Set(matches.map((match) => match[1]));
}

function runtimeMethods(contract) {
  const entrypoint = path.join(rootDir, contract.entrypoint);
  if (!fs.existsSync(entrypoint)) {
    throw new Error(`${contract.name}: ${contract.entrypoint} not found; run npm run build first`);
  }
  const module = require(entrypoint);
  const instance = module[contract.factory]();
  return new Set(
    Object.entries(instance)
      .filter(([, value]) => typeof value === "function")
      .map(([name]) => name),
  );
}

function difference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort();
}

let failed = false;

for (const contract of contracts) {
  const typed = interfaceMethods(contract);
  const documented = documentedMethods(contract);
  const runtime = runtimeMethods(contract);
  const comparisons = [
    ["missing in docs", difference(typed, documented)],
    ["extra in docs", difference(documented, typed)],
    ["missing at runtime", difference(typed, runtime)],
    ["extra at runtime", difference(runtime, typed)],
  ];
  const problems = comparisons.filter(([, methods]) => methods.length > 0);
  if (problems.length === 0) {
    console.log(`✓ ${contract.name}: ${typed.size} public methods match types, docs and runtime`);
    continue;
  }
  failed = true;
  console.error(`✗ ${contract.name}`);
  for (const [label, methods] of problems) {
    console.error(`  ${label}: ${methods.join(", ")}`);
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("API documentation contracts are in sync.");
}
