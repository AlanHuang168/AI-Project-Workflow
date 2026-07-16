import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { syncAdapters, checkAdapters } from "../src/lib/adapters.js";
import { validateProject, parseFrontmatter } from "../src/lib/validate.js";
import { ROOT } from "../src/lib/path-utils.js";
import { initCommand } from "../src/commands/init.js";

test("frontmatter parser supports scalar keys", () => {
  const fm = parseFrontmatter("---\nname: init\nstage: init\nversion: 1.0.0\n---\n");
  assert.equal(fm.name, "init");
  assert.equal(fm.stage, "init");
});

test("sync detects generated adapter drift", async () => {
  const root = await mkdtemp(join(tmpdir(), "apw-sync-"));
  assert.equal((await initCommand(root, { platform: "codex", force: false, dryRun: false })).code, 0);
  assert.equal((await syncAdapters(root, { platform: "codex" })).code, 0);

  const note = join(root, ".ai-workflow", "adapters", "codex", "README.md");
  const original = await readFile(note, "utf8");
  await writeFile(note, `${original}\nchanged\n`, "utf8");
  const check = await checkAdapters(root, { platform: "codex" });
  assert.equal(check.code, 1);
  assert.match(check.messages.join("\n"), /outdated generated file/);
});

test("repository validates with generated adapters in sync", async () => {
  const result = await validateProject(ROOT);
  assert.equal(result.code, 0, result.messages.join("\n"));
});

test("new cursor project validates without README", async () => {
  const root = await mkdtemp(join(tmpdir(), "apw-cursor-no-readme-"));
  assert.equal((await initCommand(root, { platform: "cursor", force: false, dryRun: false })).code, 0);
  await assert.rejects(readFile(join(root, "README.md"), "utf8"), { code: "ENOENT" });

  const result = await validateProject(root);
  assert.equal(result.code, 0, result.messages.join("\n"));
  assert.equal(result.messages.some((line) => line.startsWith("WARN ")), false, result.messages.join("\n"));
});
