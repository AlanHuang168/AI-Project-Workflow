import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { main } from "../src/cli.js";
import { initCommand } from "../src/commands/init.js";
import { STAGES, VERSION, WORKFLOW_VERSION } from "../src/lib/constants.js";
import { ROOT } from "../src/lib/path-utils.js";
import {
  loadWorkflowConfig,
  normalizeWorkflowConfig,
  parseProjectYaml,
  stageIds,
  validateWorkflowConfig
} from "../src/lib/workflow-config.js";
import { validateProject } from "../src/lib/validate.js";

async function tempProject(prefix = "apw-config-") {
  return mkdtemp(join(tmpdir(), prefix));
}

async function writeProjectConfig(root, stages) {
  await mkdir(join(root, ".apw"), { recursive: true });
  await writeFile(
    join(root, ".apw", "project.yaml"),
    `protocolVersion: 1.0.0\nstages:\n${stages.map((stage) => `  - ${stage}`).join("\n")}\n`,
    "utf8"
  );
}

async function writeProjectSkill(root, stage) {
  await mkdir(join(root, ".apw", "skills", stage), { recursive: true });
  await writeFile(
    join(root, ".apw", "skills", stage, "SKILL.md"),
    `---\nname: ${stage}\ndescription: ${stage} project skill\nversion: 1.0.0\nstage: ${stage}\n---\n\n# ${stage}\n`,
    "utf8"
  );
}

async function captureStdout(fn) {
  const oldLog = console.log;
  const lines = [];
  console.log = (line = "") => lines.push(String(line));
  try {
    const code = await fn();
    return { code, output: lines.join("\n") };
  } finally {
    console.log = oldLog;
  }
}

test("workflow config falls back to the built-in eight-stage flow", async () => {
  const root = await tempProject();
  const loaded = await loadWorkflowConfig(root);
  assert.equal(loaded.source, "default");
  assert.equal(loaded.config.protocolVersion, WORKFLOW_VERSION);
  assert.deepEqual(stageIds(loaded.config), STAGES);
  assert.deepEqual(loaded.errors, []);
});

test("workflow config parses custom string and object stages", () => {
  const raw = parseProjectYaml(`
protocolVersion: "1.0.0"
stages:
  - discovery
  - id: build
    title: Build
    description: Build the release candidate
`);
  const config = normalizeWorkflowConfig(raw);
  assert.deepEqual(config.stages, [
    { id: "discovery" },
    { id: "build", title: "Build", description: "Build the release candidate" }
  ]);
  assert.deepEqual(validateWorkflowConfig(raw, config), []);
});

test("workflow config detects duplicate and illegal stage ids", () => {
  const raw = {
    protocolVersion: "1.0.0",
    stages: ["alpha", "alpha", "Bad_Name"]
  };
  const errors = validateWorkflowConfig(raw, normalizeWorkflowConfig(raw));
  assert.equal(errors.includes("duplicate stage id: alpha"), true);
  assert.equal(errors.includes("illegal stage id: Bad_Name"), true);
});

test("workflow config detects unknown fields", () => {
  const raw = {
    protocolVersion: "1.0.0",
    owner: "team",
    stages: [{ id: "init", extra: "nope" }]
  };
  const errors = validateWorkflowConfig(raw, normalizeWorkflowConfig(raw));
  assert.equal(errors.includes("unknown workflow config field: owner"), true);
  assert.equal(errors.includes("unknown stage field: stages[0].extra"), true);
});

test("workflow config detects empty protocolVersion and empty stages", () => {
  let raw = parseProjectYaml("protocolVersion:\nstages:\n  - init\n");
  let errors = validateWorkflowConfig(raw, normalizeWorkflowConfig(raw));
  assert.equal(errors.includes("workflow config protocolVersion must be a non-empty string"), true);

  raw = parseProjectYaml("protocolVersion: 1.0.0\nstages:\n");
  errors = validateWorkflowConfig(raw, normalizeWorkflowConfig(raw));
  assert.equal(errors.includes("workflow config stages must be a non-empty list"), true);
});

test("validateProject uses stages from .apw/project.yaml", async () => {
  const root = await tempProject();
  await writeProjectConfig(root, ["alpha", "beta"]);
  await writeProjectSkill(root, "alpha");
  await writeProjectSkill(root, "beta");
  assert.equal((await initCommand(root, { platform: "codex", force: false, dryRun: false })).code, 0);

  for (const agent of await readdir(join(root, "core", "agents"))) {
    await writeFile(
      join(root, "core", "agents", agent),
      "---\nname: custom-agent\ndefault_skills:\n  - alpha\n---\n\n# Custom Agent\n",
      "utf8"
    );
  }

  const result = await validateProject(root, { platform: "codex" });
  assert.equal(result.code, 0, result.messages.join("\n"));
  assert.equal(result.messages.includes("PASS skill exists alpha"), true);
  assert.equal(result.messages.includes("PASS skill exists beta"), true);
});

test("validate reports missing custom project Skill", async () => {
  const root = await tempProject();
  await writeProjectConfig(root, ["init", "discovery", "review"]);
  assert.equal((await initCommand(root, { platform: "cursor", force: false, dryRun: false })).code, 0);

  const result = await validateProject(root);
  assert.equal(result.code, 1);
  assert.match(result.messages.join("\n"), /missing skill discovery/);
  assert.match(result.messages.join("\n"), /\.apw\/skills\/discovery\/SKILL\.md/);
});

test(".apw project Skill takes priority over core Skill", async () => {
  const root = await tempProject();
  await writeProjectConfig(root, ["init"]);
  await writeProjectSkill(root, "init");
  assert.equal((await initCommand(root, { platform: "codex", force: false, dryRun: false })).code, 0);
  await writeFile(
    join(root, "core", "skills", "init", "SKILL.md"),
    "---\nname: wrong\nstage: wrong\nversion: 1.0.0\ndescription: wrong\n---\n",
    "utf8"
  );

  const result = await validateProject(root, { platform: "codex" });
  assert.equal(result.code, 0, result.messages.join("\n"));
});

test("init records custom workflow stages in state", async () => {
  const root = await tempProject();
  await writeProjectConfig(root, ["init", "discovery", "impl", "review"]);
  await writeProjectSkill(root, "discovery");

  assert.equal((await initCommand(root, { platform: "cursor", force: false, dryRun: false })).code, 0);
  const state = JSON.parse(await readFile(join(root, ".ai-workflow", "state.json"), "utf8"));
  assert.equal(state.workflowVersion, "1.0.0");
  assert.equal(state.workflowProtocolVersion, "1.0.0");
  assert.deepEqual(state.workflowStages, ["init", "discovery", "impl", "review"]);
  assert.equal(state.currentStage, "init");
});

test("status displays configured custom stage order", async () => {
  const root = await tempProject();
  await writeProjectConfig(root, ["init", "discovery", "build", "review"]);
  await writeProjectSkill(root, "discovery");
  await writeProjectSkill(root, "build");
  assert.equal((await initCommand(root, { platform: "codex", force: false, dryRun: false })).code, 0);

  const result = await captureStdout(() => main(["status", root]));
  assert.equal(result.code, 0, result.output);
  assert.match(result.output, /Workflow version: 1\.0\.0/);
  assert.match(result.output, /Workflow protocol version: 1\.0\.0/);
  assert.match(result.output, /Configured stages: init, discovery, build, review/);
});

test("validate reports state stages outside the configured workflow", async () => {
  const root = await tempProject();
  await writeProjectConfig(root, ["init", "review"]);
  assert.equal((await initCommand(root, { platform: "codex", force: false, dryRun: false })).code, 0);
  const statePath = join(root, ".ai-workflow", "state.json");
  const state = JSON.parse(await readFile(statePath, "utf8"));
  state.currentStage = "deploy";
  state.completedStages = ["init", "deploy"];
  state.skippedStages = [{ stage: "retro", reason: "test" }];
  state.workflowStages = ["init", "review", "deploy"];
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");

  const result = await validateProject(root, { platform: "codex" });
  assert.equal(result.code, 1);
  assert.match(result.messages.join("\n"), /currentStage is not configured: deploy/);
  assert.match(result.messages.join("\n"), /completedStages contains unconfigured stage: deploy/);
  assert.match(result.messages.join("\n"), /skippedStages contains unconfigured stage: retro/);
  assert.match(result.messages.join("\n"), /workflowStages contains unconfigured stage: deploy/);
});

test("old workflow state files remain compatible", async () => {
  const root = await tempProject();
  assert.equal((await initCommand(root, { platform: "codex", force: false, dryRun: false })).code, 0);
  const statePath = join(root, ".ai-workflow", "state.json");
  const state = JSON.parse(await readFile(statePath, "utf8"));
  delete state.workflowProtocolVersion;
  delete state.workflowStages;
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");

  const result = await validateProject(root, { platform: "codex" });
  assert.equal(result.code, 0, result.messages.join("\n"));
});

test("CLI reports the current package version", async () => {
  const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
  assert.equal(VERSION, pkg.version);

  const result = await captureStdout(() => main(["--version"]));
  assert.equal(result.code, 0);
  assert.equal(result.output.trim(), pkg.version);
});
