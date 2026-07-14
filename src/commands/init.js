import { mkdir } from "node:fs/promises";
import { installCommand } from "./install.js";

export async function initCommand(target, options = {}) {
  if (!options.dryRun) {
    await mkdir(target, { recursive: true });
  }
  return installCommand(target, { ...options, allowMissingTarget: options.dryRun });
}
