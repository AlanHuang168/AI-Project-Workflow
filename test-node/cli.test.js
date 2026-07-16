import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rename, writeFile } from "node:fs/promises";
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
  // Adapter dot-directories are installed at the project root, the only
  // location the tools actually load them from.
  const mdc = await readFile(join(target, ".cursor", "rules", "ai-sdd.mdc"), "utf8");
  assert.match(mdc, /AUTO-GENERATED/);
  assert.match(mdc, /^---\n/, "frontmatter must start on the first line");
  assert.match(await readFile(join(target, ".cursor", "skills", "prd", "SKILL.md"), "utf8"), /AUTO-GENERATED/);
  await assert.rejects(readFile(join(target, "adapters", "cursor", ".cursor", "rules", "ai-sdd.mdc"), "utf8"), { code: "ENOENT" });
  // Everything APW-internal is consolidated under .ai-workflow/; the project
  // root stays clean and content references the runtime location.
  assert.match(await readFile(join(target, ".ai-workflow", "VERSION"), "utf8"), /\d+\.\d+\.\d+/);
  assert.match(await readFile(join(target, ".ai-workflow", "runtime", "skills", "prd", "SKILL.md"), "utf8"), /name: prd/);
  await assert.rejects(readFile(join(target, "VERSION"), "utf8"), { code: "ENOENT" });
  await assert.rejects(readFile(join(target, "core", "skills", "prd", "SKILL.md"), "utf8"), { code: "ENOENT" });
  assert.match(await readFile(join(target, "AGENTS.md"), "utf8"), /\.ai-workflow\/runtime\/skills/);
  assert.doesNotMatch(mdc, /`core\//);
  assert.equal(await main(["status", target]), 0);
  assert.equal(await main(["validate", target]), 0);
});

test("migrate upgrades a legacy core/ install to the .ai-workflow layout", async () => {
  const root = await tempProject();
  const target = join(root, "legacy-proj");
  assert.equal(await main(["init", target, "--platform", "cursor"]), 0);

  // Reconstruct the pre-0.3 layout: core/ and VERSION at the project root.
  await rename(join(target, ".ai-workflow", "runtime"), join(target, "core"));
  await rename(join(target, ".ai-workflow", "VERSION"), join(target, "VERSION"));

  assert.equal(await main(["migrate", target]), 0);
  await readFile(join(target, "core", "skills", "prd", "SKILL.md"), "utf8"); // dry run must not move

  assert.equal(await main(["migrate", target, "--apply"]), 0);
  assert.match(await readFile(join(target, ".ai-workflow", "runtime", "skills", "prd", "SKILL.md"), "utf8"), /name: prd/);
  await assert.rejects(readFile(join(target, "VERSION"), "utf8"), { code: "ENOENT" });
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
