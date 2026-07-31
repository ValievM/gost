import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const markdownFiles = [
  "README.md",
  "AGENTS.md",
]
  .map((name) => path.join(ROOT, name))
  .filter(fs.existsSync);

function collectMarkdown(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) collectMarkdown(fullPath);
    else if (entry.isFile() && entry.name.endsWith(".md")) markdownFiles.push(fullPath);
  }
}

collectMarkdown(path.join(ROOT, "docs"));

const failures = [];

for (const filePath of markdownFiles) {
  const relativeFile = path.relative(ROOT, filePath);
  const source = fs.readFileSync(filePath, "utf8");

  for (const match of source.matchAll(/\[[^\]]*]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g, "");
    if (
      target.startsWith("#")
      || /^[a-z][a-z0-9+.-]*:/i.test(target)
    ) continue;

    const cleanTarget = decodeURIComponent(target.split("#", 1)[0].split("?", 1)[0]);
    const resolved = path.resolve(path.dirname(filePath), cleanTarget);
    if (!fs.existsSync(resolved)) {
      failures.push(`${relativeFile}: missing link target ${target}`);
    }
  }

  const lines = source.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const fence = lines[index].match(/^```(js|javascript|cjs|ts|typescript|mts|cts)\s*$/);
    if (!fence) continue;
    const language = fence[1];
    const startLine = index + 2;
    const block = [];
    index++;
    while (index < lines.length && !/^```\s*$/.test(lines[index])) {
      block.push(lines[index]);
      index++;
    }
    if (index >= lines.length) {
      failures.push(`${relativeFile}:${startLine}: unclosed JavaScript fence`);
      break;
    }
    const code = block.join("\n");
    if (language === "js" || language === "javascript" || language === "cjs") {
      try {
        new vm.Script(code, { filename: `${relativeFile}:${startLine}` });
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error));
      }
      continue;
    }

    const firstCodeLine = block.find((line) => line.trim().length > 0)?.trim();
    if (firstCodeLine !== "// check-docs") continue;

    const checkedCode = block.filter((line) => line.trim() !== "// check-docs").join("\n");
    const result = ts.transpileModule(checkedCode, {
      compilerOptions: {
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: `${relativeFile}:${startLine}.${language === "typescript" ? "ts" : language}`,
      reportDiagnostics: true,
    });
    for (const diagnostic of result.diagnostics ?? []) {
      if (diagnostic.category !== ts.DiagnosticCategory.Error) continue;
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      failures.push(`${relativeFile}:${startLine}: ${message}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`✓ documentation: ${markdownFiles.length} Markdown files checked`);
}
