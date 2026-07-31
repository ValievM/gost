import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const markdownFiles = [
  path.join(ROOT, "README.md"),
  path.join(ROOT, "AGENTS.md"),
];

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
    if (!/^```(?:js|javascript|cjs)\s*$/.test(lines[index])) continue;
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
    try {
      new vm.Script(block.join("\n"), { filename: `${relativeFile}:${startLine}` });
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`✓ documentation: ${markdownFiles.length} Markdown files checked`);
}
