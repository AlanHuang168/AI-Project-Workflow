import { basename, join, relative, sep } from "node:path";
import { PLATFORM_CHOICES, PLATFORM_DOT_DIRS } from "../lib/constants.js";
import { expandPlatforms } from "../lib/adapters.js";
import { copyFileSafe, writeFileSafe } from "../lib/safe-copy.js";
import { initialState } from "../lib/state.js";
import { exists, isDirectory, listFiles, readText } from "../lib/fs-utils.js";
import { ROOT, rel } from "../lib/path-utils.js";
import { loadWorkflowConfig } from "../lib/workflow-config.js";
import { RUNTIME_DIR, WORKFLOW_DIR, isTextDocPath, toProjectPaths } from "../lib/layout.js";

// Installed projects keep every APW-internal file under .ai-workflow/ so the
// project root only shows the user's own files, the AI entry points
// (AGENTS.md, CLAUDE.md) and the tool dot-directories that the tools
// themselves require at the root. Canonical core/ path references inside
// markdown content are rewritten to .ai-workflow/runtime/ on the way in.
async function installFile(source, destination, context) {
  if (isTextDocPath(source)) {
    await writeFileSafe(destination, toProjectPaths(await readText(source)), context);
  } else {
    await copyFileSafe(source, destination, context);
  }
}

async function installTree(sourceRoot, targetRoot, context) {
  for (const source of await listFiles(sourceRoot)) {
    await installFile(source, join(targetRoot, relative(sourceRoot, source)), context);
  }
}

// Adapter dot-directories (.cursor/, .trae/, ...) must be installed at the
// project root because that is the only location the tools load them from.
// Everything else in an adapter (README notes) goes to
// .ai-workflow/adapters/<platform>/.
async function installAdapter(platform, target, context) {
  const source = join(ROOT, "adapters", platform);
  if (!(await exists(source))) return;
  const dotDir = PLATFORM_DOT_DIRS[platform];
  for (const file of await listFiles(source)) {
    const relPath = relative(source, file);
    const inDotDir = dotDir && (relPath === dotDir || relPath.startsWith(`${dotDir}${sep}`));
    const destination = inDotDir
      ? join(target, relPath)
      : join(target, WORKFLOW_DIR, "adapters", platform, relPath);
    await installFile(file, destination, context);
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
  const workflowConfig = await loadWorkflowConfig(target);
  if (workflowConfig.errors.length) {
    return { code: 2, messages: workflowConfig.errors.map((error) => `FAIL ${error}`) };
  }

  const context = { force: options.force, dryRun: options.dryRun, installed: [], conflicts: [] };
  for (const name of ["AGENTS.md", "CLAUDE.md"]) {
    await installFile(join(ROOT, name), join(target, name), context);
  }
  await copyFileSafe(join(ROOT, "VERSION"), join(target, WORKFLOW_DIR, "VERSION"), context);
  await installTree(join(ROOT, "core"), join(target, RUNTIME_DIR), context);
  await writeFileSafe(
    join(target, WORKFLOW_DIR, "state.json"),
    `${JSON.stringify(initialState(basename(target), workflowConfig.config), null, 2)}\n`,
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
