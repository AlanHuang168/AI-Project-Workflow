import { basename, dirname, join, relative } from "node:path";
import { copyPath, exists, listFiles, writeText } from "./fs-utils.js";

function conflictPath(target) {
  return join(dirname(target), `${basename(target)}.ai-sdd.new`);
}

export async function copyFileSafe(source, target, context) {
  const { force = false, dryRun = false, installed, conflicts } = context;
  if ((await exists(target)) && !force) {
    const alt = conflictPath(target);
    await copyPath(source, alt, { dryRun });
    conflicts.push(target);
    installed.push(alt);
    return;
  }
  await copyPath(source, target, { dryRun });
  installed.push(target);
}

export async function writeFileSafe(target, content, context) {
  const { force = false, dryRun = false, installed, conflicts } = context;
  if ((await exists(target)) && !force) {
    const alt = conflictPath(target);
    await writeText(alt, content, { dryRun });
    conflicts.push(target);
    installed.push(alt);
    return;
  }
  await writeText(target, content, { dryRun });
  installed.push(target);
}

export async function copyTreeSafe(sourceRoot, targetRoot, context) {
  for (const source of await listFiles(sourceRoot)) {
    await copyFileSafe(source, join(targetRoot, relative(sourceRoot, source)), context);
  }
}
