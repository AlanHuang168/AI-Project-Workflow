import { VERSION, PLATFORM_CHOICES } from "./lib/constants.js";
import { resolveTarget } from "./lib/path-utils.js";
import { initCommand } from "./commands/init.js";
import { installCommand } from "./commands/install.js";
import { syncCommand } from "./commands/sync.js";
import { validateCommand } from "./commands/validate.js";
import { statusCommand } from "./commands/status.js";
import { migrateCommand } from "./commands/migrate.js";

const COMMANDS = new Set(["init", "install", "sync", "validate", "status", "migrate"]);

export function helpText() {
  return `AI-Project-Workflow CLI

Usage:
  apw init [target] [--platform <name>] [--force] [--dry-run]
  apw install [target] [--platform <name>] [--force] [--dry-run]
  apw sync [target] [--platform <name>] [--dry-run]
  apw validate [target] [--platform <name>]
  apw status [target]
  apw migrate [target] [--apply] [--dry-run]
  apw --help
  apw --version

Platforms: ${PLATFORM_CHOICES.join(", ")}
`;
}

function parse(argv) {
  const args = [...argv];
  const command = args.shift();
  const options = { force: false, dryRun: false, apply: false };
  let target = ".";

  while (args.length) {
    const arg = args.shift();
    if (arg === "--platform") {
      const value = args.shift();
      if (!value) throw new Error("--platform requires a value");
      options.platform = value;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--apply") {
      options.apply = true;
    } else if (arg.startsWith("--")) {
      throw new Error(`unknown option: ${arg}`);
    } else {
      target = arg;
    }
  }

  return { command, target: resolveTarget(target), options };
}

function printResult(result) {
  for (const line of result.messages ?? []) console.log(line);
}

export async function main(argv) {
  try {
    if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
      console.log(helpText());
      return 0;
    }
    if (argv[0] === "--version" || argv[0] === "-v") {
      console.log(VERSION);
      return 0;
    }

    const { command, target, options } = parse(argv);
    if (!COMMANDS.has(command)) {
      console.error(`FAIL unknown command: ${command}`);
      console.error(helpText());
      return 2;
    }

    const handlers = {
      init: initCommand,
      install: installCommand,
      sync: syncCommand,
      validate: validateCommand,
      status: statusCommand,
      migrate: migrateCommand
    };
    const result = await handlers[command](target, options);
    printResult(result);
    return result.code;
  } catch (error) {
    console.error(`FAIL ${error.message}`);
    return 1;
  }
}
