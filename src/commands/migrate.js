import { join } from "node:path";
import { movePath, exists, listFiles, readText, writeText } from "../lib/fs-utils.js";
import { rel } from "../lib/path-utils.js";
import { PLATFORMS } from "../lib/constants.js";
import { RUNTIME_DIR, WORKFLOW_DIR, isTextDocPath, toProjectPaths } from "../lib/layout.js";

const LEGACY_PATHS = [".trae/skills", ".trae/agents", ".trae/rules.md", "skills", "agents", "rules.md"];

function stamp() {
  return new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\..+$/, "").replace("T", "-");
}

// Moves that upgrade an older installed project to the consolidated
// .ai-workflow/ layout. Source repositories (which have src/) are never
// touched: core/ and adapters/ are their canonical sources.
async function layoutMoves(target) {
  if (await exists(join(target, "src", "lib", "adapters.js"))) return [];
  const moves = [];
  if (await exists(join(target, "core"))) moves.push(["core", RUNTIME_DIR]);
  if (await exists(join(target, "VERSION"))) moves.push(["VERSION", join(WORKFLOW_DIR, "VERSION")]);
  if (await exists(join(target, ".apw", "project.yaml"))) {
    moves.push([join(".apw", "project.yaml"), join(WORKFLOW_DIR, "project.yaml")]);
  }
  if (await exists(join(target, ".apw", "skills"))) {
    moves.push([join(".apw", "skills"), join(WORKFLOW_DIR, "skills")]);
  }
  for (const platform of PLATFORMS) {
    if (await exists(join(target, "adapters", platform))) {
      moves.push([join("adapters", platform), join(WORKFLOW_DIR, "adapters", platform)]);
    }
  }
  return moves;
}

// After moving core/ to .ai-workflow/runtime/, markdown content still points
// at core/... paths; rewrite the moved runtime docs, the entry points and any
// installed adapter dot-directories.
async function rewriteProjectPaths(target, options) {
  const rewritten = [];
  const starts = [
    join(target, RUNTIME_DIR),
    join(target, "AGENTS.md"),
    join(target, "CLAUDE.md"),
    ...[".cursor", ".trae", ".qoder", ".codebuddy", ".catpaw"].map((dir) => join(target, dir))
  ];
  for (const start of starts) {
    if (!(await exists(start))) continue;
    const files = (await listFiles(start)).length ? await listFiles(start) : [start];
    for (const file of files) {
      if (!isTextDocPath(file)) continue;
      const text = await readText(file);
      const next = toProjectPaths(text);
      if (next === text) continue;
      await writeText(file, next, { dryRun: options.dryRun });
      rewritten.push(rel(target, file));
    }
  }
  return rewritten;
}

export async function migrateCommand(target, options = {}) {
  const legacy = [];
  for (const path of LEGACY_PATHS) {
    if (await exists(join(target, path))) legacy.push(path);
  }
  const moves = await layoutMoves(target);

  if (!legacy.length && !moves.length) return { code: 0, messages: ["PASS no legacy paths found"] };

  const destRoot = join(target, "legacy", `backup-${stamp()}`);
  const messages = ["Migration mapping:"];
  for (const path of legacy) {
    messages.push(`- ${path} -> ${rel(target, join(destRoot, path))}`);
  }
  for (const [from, to] of moves) {
    messages.push(`- ${from} -> ${to}`);
  }

  if (!options.apply) {
    messages.push("Dry run only. Re-run with --apply to modify files.");
    return { code: 0, messages };
  }

  for (const path of legacy) {
    const source = join(target, path);
    const destination = join(destRoot, path);
    if (await exists(destination)) return { code: 1, messages: [`FAIL target already exists: ${rel(target, destination)}`] };
    await movePath(source, destination, { dryRun: options.dryRun });
  }

  for (const [from, to] of moves) {
    const destination = join(target, to);
    if (await exists(destination)) return { code: 1, messages: [`FAIL target already exists: ${to}`] };
    await movePath(join(target, from), destination, { dryRun: options.dryRun });
  }

  if (moves.length) {
    const rewritten = await rewriteProjectPaths(target, options);
    if (rewritten.length) messages.push(`Rewrote core/ path references in ${rewritten.length} file(s).`);
  }

  messages.push(`${options.dryRun ? "DRY-RUN" : "PASS"} migrated to the .ai-workflow layout`);
  return { code: 0, messages };
}
