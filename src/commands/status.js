import { readState } from "../lib/state.js";
import { presentPlatforms } from "../lib/adapters.js";
import { loadWorkflowConfig, stageIds } from "../lib/workflow-config.js";

async function detectPlatforms(target) {
  return (await presentPlatforms(target)).sort();
}

export async function statusCommand(target) {
  const state = await readState(target);
  if (!state) return { code: 1, messages: [`FAIL missing .ai-workflow/state.json in ${target}`] };
  const workflowConfig = await loadWorkflowConfig(target);
  if (workflowConfig.errors.length) {
    return { code: 2, messages: workflowConfig.errors.map((error) => `FAIL ${error}`) };
  }
  const configuredStages = state.workflowStages ?? stageIds(workflowConfig.config);
  const workflowVersion = state.workflowVersion ?? workflowConfig.config.protocolVersion;
  const protocolVersion = state.workflowProtocolVersion ?? workflowVersion;
  const platforms = await detectPlatforms(target);

  const messages = [
    `Project: ${state.projectName}`,
    `Workflow version: ${workflowVersion}`,
    `Workflow protocol version: ${protocolVersion}`,
    `Configured stages: ${configuredStages.join(", ") || "(none)"}`,
    `Current stage: ${state.currentStage}`,
    `Completed stages: ${(state.completedStages ?? []).join(", ") || "(none)"}`,
    `Skipped stages: ${(state.skippedStages ?? []).map((item) => typeof item === "string" ? item : item.stage).join(", ") || "(none)"}`,
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
