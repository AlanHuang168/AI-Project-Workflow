import { join } from "node:path";
import { WORKFLOW_VERSION } from "./constants.js";
import { exists, readText, writeText } from "./fs-utils.js";

export function initialState(projectName) {
  return {
    workflowVersion: WORKFLOW_VERSION,
    projectName,
    currentStage: "init",
    completedStages: [],
    blocked: false,
    blockReason: "",
    documents: {
      prd: "missing",
      arch: "missing",
      sdd: "missing",
      test: "missing",
      review: "missing",
      deploy: "missing",
      retro: "missing"
    },
    skippedStages: [],
    lastUpdatedAt: new Date().toISOString()
  };
}

export async function readState(target) {
  const path = join(target, ".ai-workflow", "state.json");
  if (!(await exists(path))) return null;
  return JSON.parse(await readText(path));
}

export async function writeState(target, state, options = {}) {
  const path = join(target, ".ai-workflow", "state.json");
  await writeText(path, `${JSON.stringify(state, null, 2)}\n`, options);
  return path;
}

export async function updateRepoImplState(root, options = {}) {
  const state = (await readState(root)) ?? initialState("AI-Project-Workflow");
  const completed = new Set(state.completedStages ?? []);
  completed.add("impl");
  state.completedStages = [...completed];
  state.currentStage = "review";
  state.blocked = false;
  state.blockReason = "";
  state.lastUpdatedAt = new Date().toISOString();
  return writeState(root, state, options);
}
