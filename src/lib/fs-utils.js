import { mkdir, readdir, readFile, stat, writeFile, copyFile, rename } from "node:fs/promises";
import { dirname, join } from "node:path";

export async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    throw error;
  }
}

export async function isDirectory(path) {
  try {
    return (await stat(path)).isDirectory();
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    throw error;
  }
}

export async function readText(path) {
  return readFile(path, "utf8");
}

export async function writeText(path, content, options = {}) {
  if (options.dryRun) return;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

export async function copyPath(source, target, options = {}) {
  if (options.dryRun) return;
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
}

export async function movePath(source, target, options = {}) {
  if (options.dryRun) return;
  await mkdir(dirname(target), { recursive: true });
  await rename(source, target);
}

export async function listFiles(root) {
  const results = [];

  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (entry.isFile()) {
        results.push(path);
      }
    }
  }

  if (await isDirectory(root)) {
    await walk(root);
  }
  return results.sort();
}
