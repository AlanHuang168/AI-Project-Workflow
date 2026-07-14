import { join } from "node:path";
import { movePath, exists } from "../lib/fs-utils.js";
import { rel } from "../lib/path-utils.js";

const LEGACY_PATHS = [".trae/skills", ".trae/agents", ".trae/rules.md", "skills", "agents", "rules.md"];

function stamp() {
  return new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\..+$/, "").replace("T", "-");
}

export async function migrateCommand(target, options = {}) {
  const existing = [];
  for (const path of LEGACY_PATHS) {
    const source = join(target, path);
    if (await exists(source)) existing.push(path);
  }

  if (!existing.length) return { code: 0, messages: ["PASS no legacy paths found"] };

  const destRoot = join(target, "legacy", `backup-${stamp()}`);
  const messages = ["Migration mapping:"];
  for (const path of existing) {
    messages.push(`- ${path} -> ${rel(target, join(destRoot, path))}`);
  }

  if (!options.apply) {
    messages.push("Dry run only. Re-run with --apply to modify files.");
    return { code: 0, messages };
  }

  for (const path of existing) {
    const source = join(target, path);
    const destination = join(destRoot, path);
    if (await exists(destination)) return { code: 1, messages: [`FAIL target already exists: ${rel(target, destination)}`] };
    await movePath(source, destination, { dryRun: options.dryRun });
  }
  messages.push(`${options.dryRun ? "DRY-RUN" : "PASS"} migrated legacy files to ${rel(target, destRoot)}`);
  return { code: 0, messages };
}
