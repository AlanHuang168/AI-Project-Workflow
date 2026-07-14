import { basename, join, relative, sep } from "node:path";
import { PLATFORM_CHOICES, PLATFORM_DOT_DIRS } from "../lib/constants.js";
import { expandPlatforms } from "../lib/adapters.js";
import { copyFileSafe, copyTreeSafe, writeFileSafe } from "../lib/safe-copy.js";
import { initialState } from "../lib/state.js";
import { exists, isDirectory, listFiles } from "../lib/fs-utils.js";
import { ROOT, rel } from "../lib/path-utils.js";

// Adapter dot-directories (.cursor/, .trae/, ...) must be installed at the
// project root because that is the only location the tools load them from.
// Everything else in an adapter (README notes) stays under adapters/<platform>/.
async function installAdapter(platform, target, context) {
  const source = join(ROOT, "adapters", platform);
  if (!(await exists(source))) return;
  const dotDir = PLATFORM_DOT_DIRS[platform];
  for (const file of await listFiles(source)) {
    const relPath = relative(source, file);
    const inDotDir = dotDir && (relPath === dotDir || relPath.startsWith(`${dotDir}${sep}`));
    const destination = inDotDir ? join(target, relPath) : join(target, "adapters", platform, relPath);
    await copyFileSafe(file, destination, context);
  }
}

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
    await installAdapter(item, target, context);
  }

  const prefix = options.dryRun ? "Would install files:" : "Installed files:";
  const messages = [prefix, ...context.installed.map((path) => `- ${rel(process.cwd(), path)}`)];
  if (context.conflicts.length) {
    messages.push("Conflicts written as .ai-sdd.new:");
    messages.push(...context.conflicts.map((path) => `- ${rel(process.cwd(), path)}`));
  }
  return { code: 0, messages };
}
