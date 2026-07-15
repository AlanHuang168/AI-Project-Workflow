import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { VERSION } from "../src/lib/constants.js";
import { ROOT } from "../src/lib/path-utils.js";

const forbiddenPublishDirs = new Set(["legacy", "scripts", "tests", "test-node", "tmp", ".ai-workflow", "node_modules"]);
const allowedFiles = [
  "bin",
  "src",
  "core",
  "adapters",
  "examples",
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "README.zh-CN.md",
  "CHANGELOG.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "VERSION"
];

async function listProjectFiles(dir = ROOT) {
  const results = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await listProjectFiles(path));
    } else if (entry.isFile()) {
      results.push(relative(ROOT, path).split("\\").join("/"));
    }
  }
  return results.sort();
}

test("package metadata is ready for public npm publishing", async () => {
  const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
  assert.equal(pkg.name, "@dayahs/ai-project-workflow");
  assert.equal(pkg.version, "0.2.0");
  assert.equal(pkg.version, VERSION);
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.equal(pkg.description, "A universal AI-native project workflow for Cursor, Claude Code, Codex, Qoder, CodeBuddy, TRAE, and other AI coding assistants.");
  assert.equal(pkg.type, "module");
  assert.equal(pkg.license, "MIT");
  assert.deepEqual(pkg.bin, {
    apw: "./bin/apw.js",
    "ai-project-workflow": "./bin/apw.js"
  });
  assert.deepEqual(pkg.engines, { node: ">=20" });
  assert.deepEqual(pkg.publishConfig, { access: "public" });
  assert.deepEqual(pkg.files, allowedFiles);
  assert.equal(pkg.scripts.test, "node --test test-node/*.test.js");
  assert.equal(pkg.scripts.validate, "node bin/apw.js validate .");
  assert.equal(pkg.scripts["pack:check"], "npm pack --dry-run");

  for (const item of pkg.files) {
    assert.equal(forbiddenPublishDirs.has(item), false, `${item} must not be published`);
  }
});

test("project has no old source files or stale publish entries", async () => {
  const files = await listProjectFiles();
  const oldSource = files.filter((file) => file.endsWith(".py") || file.endsWith(".pyc"));
  assert.deepEqual(oldSource, []);

  const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
  for (const forbidden of forbiddenPublishDirs) {
    assert.equal(pkg.files.includes(forbidden), false, `${forbidden} is not an npm file entry`);
  }
});

test("readme and example only document the Node CLI", async () => {
  const readme = await readFile(join(ROOT, "README.md"), "utf8");
  const zhReadme = await readFile(join(ROOT, "README.zh-CN.md"), "utf8");
  const example = await readFile(join(ROOT, "examples", "minimal-project", "README.md"), "utf8");
  const pyCmd = "py" + "thon3";
  const oldRefs = [
    `${pyCmd} scripts/`,
    `${pyCmd} ../../scripts/`,
    ["legacy", ["py", "thon-cli"].join("")].join("/"),
    ["scripts", "install.py"].join("/"),
    ["scripts", "validate.py"].join("/"),
    ["scripts", "sync_adapters.py"].join("/"),
    ["scripts", "migrate_legacy.py"].join("/")
  ];

  for (const ref of oldRefs) {
    assert.equal(readme.includes(ref), false, `README contains ${ref}`);
    assert.equal(example.includes(ref), false, `example contains ${ref}`);
  }
  assert.match(readme, /npx @dayahs\/ai-project-workflow init \. --platform cursor/);
  assert.match(readme, /\[Chinese documentation\]\(\.\/README\.zh-CN\.md\)/);
  assert.match(zhReadme, /\[English\]\(\.\/README\.md\)/);
});
