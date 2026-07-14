import { basename, join } from "node:path";
import { PLATFORM_CHOICES } from "../lib/constants.js";
import { expandPlatforms } from "../lib/adapters.js";
import { copyFileSafe, copyTreeSafe, writeFileSafe } from "../lib/safe-copy.js";
import { initialState } from "../lib/state.js";
import { exists, isDirectory } from "../lib/fs-utils.js";
import { ROOT, rel } from "../lib/path-utils.js";

export async function installCommand(target, options = {}) {
  const platform = options.platform ?? "codex";
  if (!PLATFORM_CHOICES.includes(platform)) {
    return { code: 2, messages: [`FAIL unsupported platform: ${platform}`] };
  }
  if (!(await isDirectory(target)) && !options.allowMissingTarget) {
    return { code: 2, messages: [`FAIL target is not a directory: ${target}`] };
  }

  const context = { force: options.force, dryRun: options.dryRun, installed: [], conflicts: [] };
  for (const name of ["AGENTS.md", "CLAUDE.md", "VERSION"]) {
    await copyFileSafe(join(ROOT, name), join(target, name), context);
  }
  await copyTreeSafe(join(ROOT, "core"), join(target, "core"), context);
  await writeFileSafe(
    join(target, ".ai-workflow", "state.json"),
    `${JSON.stringify(initialState(basename(target)), null, 2)}\n`,
    context
  );

  for (const item of expandPlatforms(platform)) {
    const source = join(ROOT, "adapters", item);
    if (await exists(source)) await copyTreeSafe(source, join(target, "adapters", item), context);
  }

  const prefix = options.dryRun ? "Would install files:" : "Installed files:";
  const messages = [prefix, ...context.installed.map((path) => `- ${rel(process.cwd(), path)}`)];
  if (context.conflicts.length) {
    messages.push("Conflicts written as .ai-sdd.new:");
    messages.push(...context.conflicts.map((path) => `- ${rel(process.cwd(), path)}`));
  }
  return { code: 0, messages };
}
