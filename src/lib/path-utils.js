import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(here, "..", "..");

export function resolveTarget(target = ".") {
  return resolve(process.cwd(), target);
}

export function rel(root, path) {
  return relative(root, path).split("\\").join("/");
}
