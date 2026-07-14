import { basename, join } from "node:path";
import { GENERATED_HEADER, LEGACY_GENERATED_HEADER, PLATFORMS, STAGES } from "./constants.js";
import { exists, listFiles, readText, writeText } from "./fs-utils.js";
import { rel } from "./path-utils.js";

function generatedHeader(root, source) {
  return `${GENERATED_HEADER}<!-- SOURCE: ${rel(root, source)} -->\n\n`;
}

// Generated files normally start with GENERATED_HEADER, but files that need
// YAML frontmatter on the first line (for example Cursor .mdc rules) carry
// the header immediately after the frontmatter block instead.
const FRONTMATTER_THEN_HEADER_RE = /^---\n[^]*?\n---\n\n?<!-- AUTO-GENERATED /;

function isGeneratedContent(text) {
  return (
    text.startsWith(GENERATED_HEADER) ||
    text.startsWith(LEGACY_GENERATED_HEADER) ||
    FRONTMATTER_THEN_HEADER_RE.test(text)
  );
}

async function renderSkill(root, stage) {
  const source = join(root, "core", "skills", stage, "SKILL.md");
  return [source, `${generatedHeader(root, source)}${await readText(source)}`];
}

async function renderAgent(root, source) {
  return [source, `${generatedHeader(root, source)}${await readText(source)}`];
}

export async function plannedFiles(root, platform) {
  const files = new Map();
  const base = join(root, "adapters", platform);
  let skillRoot = null;
  let agentRoot = null;

  if (platform === "cursor") {
    const rule = join(base, ".cursor", "rules", "ai-sdd.mdc");
    files.set(
      rule,
      `---\ndescription: AI Project Workflow rules for Cursor\nalwaysApply: true\n---\n\n${GENERATED_HEADER}<!-- SOURCE: AGENTS.md + core/rules -->\n\n# AI Project Workflow Cursor Adapter\n\nBefore starting a task, read \`AGENTS.md\`, \`core/rules/\`, \`core/skills/<stage>/SKILL.md\`, and \`.ai-workflow/state.json\` from the project root.\nThis file is a lightweight entry point. The canonical source is \`core/\`.\n`
    );
    skillRoot = join(base, ".cursor", "skills");
    agentRoot = join(base, ".cursor", "agents");
  } else if (platform === "trae") {
    const rules = join(base, ".trae", "rules.md");
    files.set(
      rules,
      `${GENERATED_HEADER}<!-- SOURCE: AGENTS.md + core/rules -->\n\n# AI Project Workflow Rules\n\nKeep the slash command convention: \`/init\`, \`/prd\`, \`/hld\`, \`/sdd\`, \`/impl\`, \`/review\`, \`/deploy\`, and \`/retro\`.\nBefore acting, read \`AGENTS.md\`, \`core/rules/\`, the active Skill, and workflow state from the project root.\n`
    );
    skillRoot = join(base, ".trae", "skills");
    agentRoot = join(base, ".trae", "agents");
  } else if (platform === "qoder") {
    skillRoot = join(base, ".qoder", "skills");
    agentRoot = join(base, ".qoder", "agents");
  } else if (platform === "codebuddy") {
    const note = join(base, "README.md");
    files.set(
      note,
      `${GENERATED_HEADER}<!-- SOURCE: README.md + AGENTS.md -->\n\n# CodeBuddy Adapter\n\nThis adapter uses a minimal compatibility convention. Prefer \`AGENTS.md\` and \`core/skills/\` from the project root.\nIf the current CodeBuddy version recognizes \`.codebuddy/skills/\` or \`.codebuddy/rules/\`, use the generated files in this directory. Otherwise, fall back to \`AGENTS.md\`.\n`
    );
    skillRoot = join(base, ".codebuddy", "skills");
    agentRoot = join(base, ".codebuddy", "agents");
  } else if (platform === "claude-code") {
    const note = join(base, "README.md");
    files.set(
      note,
      `${GENERATED_HEADER}<!-- SOURCE: CLAUDE.md -->\n\n# Claude Code Adapter\n\nUse root \`CLAUDE.md\` as the lightweight entry point, then continue with \`AGENTS.md\`, \`core/rules/\`, and \`core/skills/\`.\n`
    );
    return files;
  } else if (platform === "codex") {
    const note = join(base, "README.md");
    files.set(
      note,
      `${GENERATED_HEADER}<!-- SOURCE: AGENTS.md -->\n\n# Codex Adapter\n\nCodex CLI primarily relies on root \`AGENTS.md\` and \`core/skills/\`. This adapter does not duplicate the full rules.\n`
    );
    return files;
  } else {
    throw new Error(`unsupported platform: ${platform}`);
  }

  for (const stage of STAGES) {
    const [, content] = await renderSkill(root, stage);
    files.set(join(skillRoot, stage, "SKILL.md"), content);
  }

  const agentSourceRoot = join(root, "core", "agents");
  for (const source of await listFiles(agentSourceRoot)) {
    if (!source.endsWith(".md")) continue;
    const [, content] = await renderAgent(root, source);
    files.set(join(agentRoot, basename(source)), content);
  }

  return files;
}

export async function ensureCoreSkills(root) {
  const missing = [];
  for (const stage of STAGES) {
    const path = join(root, "core", "skills", stage, "SKILL.md");
    if (!(await exists(path))) missing.push(path);
  }
  return missing;
}

export function expandPlatforms(platform) {
  return platform === "all" ? PLATFORMS : [platform];
}

export async function presentPlatforms(root) {
  const found = [];
  for (const platform of PLATFORMS) {
    if (await exists(join(root, "adapters", platform))) found.push(platform);
  }
  return found;
}

export async function syncAdapters(root, options = {}) {
  const platforms = expandPlatforms(options.platform ?? "all");
  const missing = await ensureCoreSkills(root);
  if (missing.length) return { code: 2, messages: missing.map((path) => `FAIL missing ${rel(root, path)}`) };

  const messages = [];
  let ok = true;
  for (const platform of platforms) {
    for (const [path, content] of await plannedFiles(root, platform)) {
      if (await exists(path)) {
        const old = await readText(path);
        if (old === content) continue;
        if (!isGeneratedContent(old)) {
          messages.push(`FAIL refusing to overwrite user file: ${rel(root, path)}`);
          ok = false;
          continue;
        }
      }
      await writeText(path, content, { dryRun: options.dryRun });
      messages.push(`${options.dryRun ? "DRY-RUN" : "SYNC"} ${rel(root, path)}`);
    }
  }
  return { code: ok ? 0 : 1, messages };
}

export async function checkAdapters(root, options = {}) {
  const platforms = options.platform ? expandPlatforms(options.platform) : ((await presentPlatforms(root)).length ? await presentPlatforms(root) : PLATFORMS);
  const missing = await ensureCoreSkills(root);
  if (missing.length) return { code: 2, messages: missing.map((path) => `FAIL missing ${rel(root, path)}`) };

  const messages = [];
  let ok = true;
  for (const platform of platforms) {
    for (const [path, content] of await plannedFiles(root, platform)) {
      if (!(await exists(path))) {
        messages.push(`FAIL missing generated file: ${rel(root, path)}`);
        ok = false;
      } else if ((await readText(path)) !== content) {
        messages.push(`FAIL outdated generated file: ${rel(root, path)}`);
        ok = false;
      }
    }
  }
  if (ok) messages.push("PASS adapters are in sync");
  return { code: ok ? 0 : 1, messages };
}
