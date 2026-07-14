import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { main } from "../src/cli.js";
import { readState } from "../src/lib/state.js";

async function tempProject() {
  return mkdtemp(join(tmpdir(), "apw-node-"));
}

test("help and version commands succeed", async () => {
  assert.equal(await main(["--help"]), 0);
  assert.equal(await main(["--version"]), 0);
});

test("init creates an installable workflow project", async () => {
  const root = await tempProject();
  const target = join(root, "demo");
  assert.equal(await main(["init", target, "--platform", "cursor"]), 0);

  const state = await readState(target);
  assert.equal(state.projectName, "demo");
  assert.equal(state.currentStage, "init");
  assert.match(await readFile(join(target, "AGENTS.md"), "utf8"), /AI Project Workflow/);
  assert.match(await readFile(join(target, "adapters", "cursor", ".cursor", "rules", "ai-sdd.mdc"), "utf8"), /AUTO-GENERATED/);
  assert.equal(await main(["status", target]), 0);
  assert.equal(await main(["validate", target]), 0);
});

test("install preserves user files unless force is set", async () => {
  const target = await tempProject();
  await writeFile(join(target, "AGENTS.md"), "custom\n", "utf8");
  assert.equal(await main(["install", target, "--platform", "codex"]), 0);

  assert.equal(await readFile(join(target, "AGENTS.md"), "utf8"), "custom\n");
  assert.match(await readFile(join(target, "AGENTS.md.ai-sdd.new"), "utf8"), /AI Project Workflow/);

  assert.equal(await main(["install", target, "--platform", "codex", "--force"]), 0);
  assert.match(await readFile(join(target, "AGENTS.md"), "utf8"), /AI Project Workflow/);
});

test("dry-run does not create target files", async () => {
  const root = await tempProject();
  const target = join(root, "dry");
  assert.equal(await main(["init", target, "--platform", "cursor", "--dry-run"]), 0);
});

test("migrate is dry-run by default and moves only with apply", async () => {
  const target = await tempProject();
  await mkdir(join(target, "skills"), { recursive: true });
  await writeFile(join(target, "skills", "old.md"), "legacy\n", "utf8");

  assert.equal(await main(["migrate", target]), 0);
  assert.equal(await readFile(join(target, "skills", "old.md"), "utf8"), "legacy\n");
  assert.equal(await main(["migrate", target, "--apply"]), 0);
});
