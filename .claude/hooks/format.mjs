import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { extname, relative, resolve, isAbsolute } from "node:path";

const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const raw = input.tool_response?.filePath ?? input.tool_input?.file_path;
if (!raw) process.exit(0);

const file = resolve(root, raw);
const rel = relative(root, file);
if (
  rel.startsWith("..") ||
  isAbsolute(rel) ||
  /(^|[\\/])(node_modules|\.next)[\\/]/.test(rel) ||
  !CODE_EXT.has(extname(file)) ||
  !existsSync(file)
)
  process.exit(0);

// 1. Quitar líneas en blanco
const src = readFileSync(file, "utf8");
const eol = src.includes("\r\n") ? "\r\n" : "\n";
const compact = src
  .split(/\r?\n/)
  .filter((line) => line.trim() !== "")
  .join(eol);
writeFileSync(file, compact + eol);

// 2. ESLint --fix, 3. Prettier --write (binarios locales del proyecto)
const run = (script, args) =>
  spawnSync(process.execPath, [resolve(root, script), ...args], {
    cwd: root,
    encoding: "utf8",
  });

const lint = run("node_modules/eslint/bin/eslint.js", ["--fix", file]);
run("node_modules/prettier/bin/prettier.cjs", ["--write", file]);

// Errores de lint que no se pueden autocorregir vuelven a Claude
if (lint.status === 1 && lint.stdout.trim()) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `ESLint: errores sin autocorregir en ${rel}:\n${lint.stdout}`,
      },
    }),
  );
}
