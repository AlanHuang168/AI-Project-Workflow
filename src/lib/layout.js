import { join } from "node:path";
import { exists } from "./fs-utils.js";

// Installed-project layout: everything APW-internal lives under .ai-workflow/
// so the target project root only shows the user's own files plus the AI
// entry points (AGENTS.md, CLAUDE.md) and the tool dot-directories that the
// tools themselves require at the root (.cursor/, .trae/, ...).
export const WORKFLOW_DIR = ".ai-workflow";
export const RUNTIME_DIR = join(WORKFLOW_DIR, "runtime");

// "core" mode: canonical source lives in core/ (this repository and legacy
// installs). "runtime" mode: installed projects keep it under
// .ai-workflow/runtime/.
export async function detectContentMode(root) {
  if (await exists(join(root, "core"))) return "core";
  if (await exists(join(root, RUNTIME_DIR))) return "runtime";
  return "core";
}

export function runtimeBase(root, contentMode) {
  return contentMode === "runtime" ? join(root, RUNTIME_DIR) : join(root, "core");
}

export function versionPath(root, contentMode) {
  return contentMode === "runtime" ? join(root, WORKFLOW_DIR, "VERSION") : join(root, "VERSION");
}

// Rewrite canonical core/ path references for installed projects. The
// replacement contains no "core/" substring, so the transform is idempotent.
export function toProjectPaths(text) {
  return text.replace(/(^|[\s`(>])core\//g, "$1.ai-workflow/runtime/");
}

export function isTextDocPath(path) {
  return path.endsWith(".md") || path.endsWith(".mdc");
}
