import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { main, helpText } from "../src/cli.js";
import { ROOT } from "../src/lib/path-utils.js";
import { validateProject } from "../src/lib/validate.js";

const hanPattern = /[\u3400-\u4DBF\u4E00-\u9FFF]/;
const englishOnlyRoots = ["core", "adapters", "src", "bin", "examples", "AGENTS.md", "CLAUDE.md", "README.en.md"];
const englishReadmeLink = "[English](./README.en.md)";
const chineseReadmeLink = "[中文文档](./README.md)";

async function listFiles(path) {
  const entries = await readdir(path, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      files.push(...await listFiles(child));
    } else if (entry.isFile()) {
      files.push(child);
    }
  }
  return files;
}

async function projectFiles(items) {
  const files = [];
  for (const item of items) {
    const path = join(ROOT, item);
    const entries = await readdir(path, { withFileTypes: true }).catch(() => null);
    if (!entries) {
      files.push(path);
    } else {
      files.push(...await listFiles(path));
    }
  }
  return files;
}

test("core runtime sources contain no Chinese characters", async () => {
  const offenders = [];
  for (const file of await projectFiles(englishOnlyRoots)) {
    const rel = relative(ROOT, file).split("\\").join("/");
    let text = await readFile(file, "utf8");
    // Language switcher link in the English README is allowed to contain Chinese
    if (rel === "README.en.md") text = text.replace(chineseReadmeLink, "");
    if (hanPattern.test(text)) offenders.push(rel);
  }
  assert.deepEqual(offenders, []);
});

test("readme language strategy is explicit", async () => {
  const readme = await readFile(join(ROOT, "README.md"), "utf8");
  const enReadme = await readFile(join(ROOT, "README.en.md"), "utf8");
  // Default README is Chinese; English lives in README.en.md
  assert.equal(hanPattern.test(readme.replace(englishReadmeLink, "")), true);
  assert.equal(hanPattern.test(enReadme.replace(chineseReadmeLink, "")), false);
  assert.match(readme, /\[English\]\(\.\/README\.en\.md\)/);
  assert.match(enReadme, /\[中文文档\]\(\.\/README\.md\)/);
});

test("CLI help and validation output are English", async () => {
  assert.equal(hanPattern.test(helpText()), false);
  const result = await validateProject(ROOT);
  assert.equal(result.code, 0, result.messages.join("\n"));
  assert.equal(hanPattern.test(result.messages.join("\n")), false);
});

test("CLI status output is English", async () => {
  assert.equal(await main(["status", "."]), 0);
});
