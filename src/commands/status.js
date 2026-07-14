import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { readState } from "../lib/state.js";
import { isDirectory } from "../lib/fs-utils.js";

async function detectPlatforms(target) {
  const adapters = join(target, "adapters");
  if (!(await isDirectory(adapters))) return [];
  const entries = await readdir(adapters, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

export async function statusCommand(target) {
  const state = await readState(target);
  if (!state) return { code: 1, messages: [`FAIL missing .ai-workflow/state.json in ${target}`] };
  const platforms = await detectPlatforms(target);

  const messages = [
    `Project: ${state.projectName}`,
    `Workflow version: ${state.workflowVersion}`,
    `Current stage: ${state.currentStage}`,
    `Completed stages: ${(state.completedStages ?? []).join(", ") || "(none)"}`,
    `Skipped stages: ${(state.skippedStages ?? []).map((item) => item.stage).join(", ") || "(none)"}`,
    `Blocked: ${state.blocked ? "yes" : "no"}`
  ];
  if (state.blockReason) messages.push(`Block reason: ${state.blockReason}`);
  if (state.documents) {
    messages.push("Documents:");
    for (const [name, status] of Object.entries(state.documents)) messages.push(`- ${name}: ${status}`);
  }
  messages.push(`Installed platforms: ${platforms.join(", ") || "(none)"}`);
  messages.push(`Detected platforms: ${platforms.join(", ") || "(none)"}`);
  messages.push(`Adapter status: ${platforms.length ? "installed" : "not installed"}`);
  if (state.lastUpdatedAt) messages.push(`Last updated: ${state.lastUpdatedAt}`);
  return { code: 0, messages };
}
