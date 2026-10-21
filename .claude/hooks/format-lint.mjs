import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const FORMAT_EXT = new Set([".tsx", ".jsx", ".ts", ".js", ".mjs", ".md", ".mdx"]);
const LINT_EXT = new Set([".tsx", ".jsx", ".ts", ".js", ".mjs"]);
const IGNORED = ["node_modules", ".next", "references",".claude"];

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

const filePath = JSON.parse(raw || "{}").tool_input?.file_path;
if (!filePath || !existsSync(filePath)) process.exit(0);

const root = process.cwd();
const rel = path.relative(root, filePath).split(path.sep);
const ext = path.extname(filePath).toLowerCase();

if (!FORMAT_EXT.has(ext) || rel[0] === ".." || IGNORED.includes(rel[0])) {
  process.exit(0);
}

const run = (args) =>
  spawnSync("npx", args, { cwd: root, encoding: "utf8", shell: true });

run(["prettier", "--write", `"${filePath}"`]);

if (LINT_EXT.has(ext)) {
  const lint = run(["eslint", "--fix", `"${filePath}"`]);
  if (lint.status !== 0) {
    process.stderr.write(`ESLint errors in ${rel.join("/")}:\n${lint.stdout}${lint.stderr}`);
    process.exit(2);
  }
}
