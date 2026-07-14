import { join } from "node:path";
import { STAGES, TEMPLATES } from "./constants.js";
import { checkAdapters } from "./adapters.js";
import { exists, listFiles, readText } from "./fs-utils.js";
import { rel } from "./path-utils.js";

const fixedModelTerms = ["so" + "nnet", "o" + "pus", "g" + "pt-4", "g" + "pt-5", "claude" + "-3", "claude" + "-4"];
const fixedModelRe = new RegExp(`\\b(${fixedModelTerms.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i");

export function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return {};
  const end = text.indexOf("\n---", 4);
  if (end === -1) return {};
  const data = {};
  let currentKey = "";
  for (const raw of text.slice(4, end).split("\n")) {
    const line = raw.trimEnd();
    if (!line) continue;
    if (line.startsWith("  - ") && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(line.slice(4).trim());
      continue;
    }
    if (line.includes(":")) {
      const index = line.indexOf(":");
      currentKey = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim();
      data[currentKey] = value === "" ? [] : value;
    }
  }
  return data;
}

class Reporter {
  constructor() {
    this.failures = 0;
    this.warnings = 0;
    this.messages = [];
  }

  pass(message) {
    this.messages.push(`PASS ${message}`);
  }

  warn(message) {
    this.warnings += 1;
    this.messages.push(`WARN ${message}`);
  }

  fail(message) {
    this.failures += 1;
    this.messages.push(`FAIL ${message}`);
  }
}

async function checkStructure(root, r) {
  for (const path of ["AGENTS.md", "CLAUDE.md", "VERSION", "core/rules", "core/skills", "core/agents", "core/templates", "core/schemas"]) {
    if (await exists(join(root, path))) r.pass(`exists ${path}`);
    else r.fail(`missing ${path}`);
  }
  for (const stage of STAGES) {
    const path = join(root, "core", "skills", stage, "SKILL.md");
    if (await exists(path)) r.pass(`skill exists ${stage}`);
    else r.fail(`missing skill ${stage}`);
  }
}

async function checkFrontmatter(root, r) {
  for (const stage of STAGES) {
    const path = join(root, "core", "skills", stage, "SKILL.md");
    if (!(await exists(path))) continue;
    const fm = parseFrontmatter(await readText(path));
    if (!Object.keys(fm).length) {
      r.fail(`missing frontmatter ${rel(root, path)}`);
      continue;
    }
    if (fm.name !== stage) r.fail(`name mismatch ${rel(root, path)}`);
    if (fm.stage !== stage) r.fail(`stage mismatch ${rel(root, path)}`);
    if (!fm.description) r.fail(`empty description ${rel(root, path)}`);
    if (!fm.version) r.fail(`empty version ${rel(root, path)}`);
    r.pass(`frontmatter ${stage}`);
  }
}

async function checkTemplatesSchemaAgents(root, r) {
  for (const name of TEMPLATES) {
    const path = join(root, "core", "templates", `${name}.template.md`);
    if ((await exists(path)) && (await readText(path)).trim()) r.pass(`template ${name}`);
    else r.fail(`missing template ${name}`);
  }

  const schema = join(root, "core", "schemas", "workflow-state.schema.json");
  try {
    JSON.parse(await readText(schema));
    r.pass("state schema valid json");
  } catch (error) {
    r.fail(`invalid state schema json: ${error.message}`);
  }

  const valid = new Set(STAGES);
  for (const path of await listFiles(join(root, "core", "agents"))) {
    if (!path.endsWith(".md")) continue;
    const fm = parseFrontmatter(await readText(path));
    const skills = Array.isArray(fm.default_skills) ? fm.default_skills : (fm.default_skills ? [fm.default_skills] : []);
    const invalid = skills.filter((item) => !valid.has(item));
    if (invalid.length) r.fail(`agent ${path.split("/").pop()} references invalid skills ${JSON.stringify(invalid)}`);
    else r.pass(`agent skills ${path.split("/").pop()}`);
  }
}

async function checkReferences(root, r) {
  const pattern = /`([^`\n]+(?:\.md|\.json))`/g;
  const optional = new Set(["README.md", "package.json", "pyproject.toml", "pom.xml", "build.gradle", "go.mod", "Cargo.toml"]);
  const starts = [join(root, "AGENTS.md"), join(root, "CLAUDE.md"), join(root, "core")];
  for (const start of starts) {
    const files = (await exists(start)) && (await listFiles(start)).length ? await listFiles(start) : ((await exists(start)) ? [start] : []);
    for (const path of files.filter((item) => item.endsWith(".md") || item.endsWith(".mdc"))) {
      const text = await readText(path);
      for (const match of text.matchAll(pattern)) {
        const ref = match[1];
        if (ref.startsWith("http://") || ref.startsWith("https://")) continue;
        if (ref.includes("{{") || ref.includes("<")) continue;
        if (optional.has(ref)) continue;
        if (ref.startsWith("docs/") || ref.startsWith(".ai-workflow/")) continue;
        if (!(await exists(join(root, ref)))) r.warn(`unresolved reference ${ref} in ${rel(root, path)}`);
      }
    }
  }
}

async function checkResidualTerms(root, r) {
  const activeDirs = ["AGENTS.md", "CLAUDE.md", "README.md", "core", "adapters", "src", "test-node"];
  const badTerms = ["Ask" + "User" + "Question"];
  for (const item of activeDirs) {
    const start = join(root, item);
    if (!(await exists(start))) continue;
    const files = (await listFiles(start)).length ? await listFiles(start) : [start];
    for (const file of files) {
      if (![".md", ".json", ".mdc", ".js", ""].some((suffix) => file.endsWith(suffix))) continue;
      const text = await readText(file);
      for (const term of badTerms) {
        if (text.includes(term)) r.fail(`residual term ${term} in ${rel(root, file)}`);
      }
      if (fixedModelRe.test(text)) r.fail(`fixed model name in ${rel(root, file)}`);
      if (text.includes("/" + "Users" + "/") || text.includes("\\" + "Users" + "\\")) {
        r.fail(`absolute user path in ${rel(root, file)}`);
      }
    }
  }
}

export async function validateProject(root, options = {}) {
  const r = new Reporter();
  await checkStructure(root, r);
  await checkFrontmatter(root, r);
  await checkTemplatesSchemaAgents(root, r);
  await checkReferences(root, r);
  await checkResidualTerms(root, r);
  const adapterResult = await checkAdapters(root, { platform: options.platform });
  r.messages.push(...adapterResult.messages);
  if (adapterResult.code === 0) r.pass("adapters in sync");
  else r.fail("adapters out of sync");

  if (r.failures) {
    r.messages.push(`FAIL validation failed with ${r.failures} failure(s), ${r.warnings} warning(s)`);
    return { code: 1, messages: r.messages };
  }
  r.messages.push(`PASS validation passed with ${r.warnings} warning(s)`);
  return { code: 0, messages: r.messages };
}
