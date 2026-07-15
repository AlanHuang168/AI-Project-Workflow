import { join } from "node:path";
import { DEFAULT_WORKFLOW_CONFIG, WORKFLOW_VERSION } from "./constants.js";
import { exists, readText } from "./fs-utils.js";
import { rel } from "./path-utils.js";

export const WORKFLOW_CONFIG_PATH = join(".apw", "project.yaml");

const TOP_LEVEL_KEYS = new Set(["protocolVersion", "stages"]);
const STAGE_KEYS = new Set(["id", "title", "description"]);
const STAGE_ID_RE = /^[a-z][a-z0-9-]*$/;

function cloneDefaultConfig() {
  return {
    protocolVersion: DEFAULT_WORKFLOW_CONFIG.protocolVersion,
    stages: DEFAULT_WORKFLOW_CONFIG.stages.map((stage) => ({ ...stage }))
  };
}

function stripInlineComment(value) {
  let quote = "";
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if ((char === "\"" || char === "'") && (!quote || quote === char)) quote = quote ? "" : char;
    if (char === "#" && !quote && (index === 0 || /\s/.test(value[index - 1]))) return value.slice(0, index).trimEnd();
  }
  return value.trimEnd();
}

function parseScalar(value) {
  const trimmed = stripInlineComment(value).trim();
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseKeyValue(text) {
  const index = text.indexOf(":");
  if (index === -1) return null;
  return [text.slice(0, index).trim(), parseScalar(text.slice(index + 1))];
}

export function parseProjectYaml(text) {
  const data = {};
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  for (let index = 0; index < lines.length;) {
    const raw = lines[index];
    const line = raw.trim();
    if (!line || line.startsWith("#")) {
      index += 1;
      continue;
    }
    if (/^\s/.test(raw)) throw new Error(`unexpected indentation on line ${index + 1}`);

    const pair = parseKeyValue(line);
    if (!pair) throw new Error(`expected key/value on line ${index + 1}`);
    const [key, value] = pair;

    if (key === "stages" && value === "") {
      const stages = [];
      index += 1;
      while (index < lines.length) {
        const itemRaw = lines[index];
        const itemLine = itemRaw.trim();
        if (!itemLine || itemLine.startsWith("#")) {
          index += 1;
          continue;
        }
        if (!/^\s/.test(itemRaw)) break;
        if (!itemLine.startsWith("- ")) throw new Error(`expected stage list item on line ${index + 1}`);

        const itemText = itemLine.slice(2).trim();
        const itemPair = parseKeyValue(itemText);
        if (!itemPair) {
          stages.push(parseScalar(itemText));
          index += 1;
          continue;
        }

        const stage = { [itemPair[0]]: itemPair[1] };
        index += 1;
        while (index < lines.length) {
          const childRaw = lines[index];
          const childLine = childRaw.trim();
          if (!childLine || childLine.startsWith("#")) {
            index += 1;
            continue;
          }
          if (!/^\s/.test(childRaw) || childLine.startsWith("- ")) break;

          const childPair = parseKeyValue(childLine);
          if (!childPair) throw new Error(`expected stage field on line ${index + 1}`);
          stage[childPair[0]] = childPair[1];
          index += 1;
        }
        stages.push(stage);
      }
      data[key] = stages;
      continue;
    }

    data[key] = value;
    index += 1;
  }

  return data;
}

function normalizeStage(stage) {
  if (typeof stage === "string") return { id: stage };
  if (stage && typeof stage === "object" && !Array.isArray(stage)) return { ...stage };
  return { id: "" };
}

export function normalizeWorkflowConfig(raw = {}) {
  return {
    protocolVersion: raw.protocolVersion === undefined ? WORKFLOW_VERSION : raw.protocolVersion,
    stages: Array.isArray(raw.stages) ? raw.stages.map(normalizeStage) : []
  };
}

export function validateWorkflowConfig(raw, config) {
  const errors = [];

  for (const key of Object.keys(raw)) {
    if (!TOP_LEVEL_KEYS.has(key)) errors.push(`unknown workflow config field: ${key}`);
  }
  if (typeof config.protocolVersion !== "string" || !config.protocolVersion.trim()) {
    errors.push("workflow config protocolVersion must be a non-empty string");
  }
  if (!Array.isArray(config.stages) || !config.stages.length) {
    errors.push("workflow config stages must be a non-empty list");
    return errors;
  }

  const seen = new Set();
  for (const [index, stage] of config.stages.entries()) {
    for (const key of Object.keys(stage)) {
      if (!STAGE_KEYS.has(key)) errors.push(`unknown stage field: stages[${index}].${key}`);
    }
    if (typeof stage.id !== "string" || !stage.id.trim()) {
      errors.push(`stage at index ${index} must include a non-empty id`);
      continue;
    }
    if (!STAGE_ID_RE.test(stage.id)) errors.push(`illegal stage id: ${stage.id}`);
    if (seen.has(stage.id)) errors.push(`duplicate stage id: ${stage.id}`);
    seen.add(stage.id);

    for (const key of ["title", "description"]) {
      if (stage[key] !== undefined && typeof stage[key] !== "string") {
        errors.push(`stage ${stage.id} ${key} must be a string`);
      }
    }
  }

  return errors;
}

export async function loadWorkflowConfig(root) {
  const path = join(root, WORKFLOW_CONFIG_PATH);
  if (!(await exists(path))) {
    return {
      source: "default",
      path,
      config: cloneDefaultConfig(),
      errors: []
    };
  }

  try {
    const raw = parseProjectYaml(await readText(path));
    const config = normalizeWorkflowConfig(raw);
    return {
      source: rel(root, path),
      path,
      config,
      errors: validateWorkflowConfig(raw, config)
    };
  } catch (error) {
    return {
      source: rel(root, path),
      path,
      config: cloneDefaultConfig(),
      errors: [`failed to parse workflow config: ${error.message}`]
    };
  }
}

export function stageIds(config) {
  return config.stages.map((stage) => stage.id);
}
