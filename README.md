# AI Project Workflow

[Chinese documentation](./README.zh-CN.md)

## Project Overview

AI Project Workflow is a universal, AI-native software delivery workflow for Cursor, Claude Code, Codex, Qoder, CodeBuddy, TRAE, and other AI coding assistants. It keeps the project workflow in a single canonical `core/` source and generates lightweight adapters for different tools.

## Why AI Project Workflow

AI coding agents can move too quickly when requirements, architecture, design, and tests are unclear. This workflow makes each stage explicit, writes deliverables to files, tracks state, and requires honest verification.

## Key Features

- Eight-stage workflow from initialization to retrospective.
- Core-first rules, Skills, Agents, templates, and schema.
- Platform adapters generated from the canonical `core/` source.
- Safe install behavior that does not overwrite user files unless `--force` is used.
- Pure Node.js CLI with no Python requirement.

## Workflow Stages

```text
init -> prd -> hld -> sdd -> impl -> review -> deploy -> retro
```

Document priority:

```text
PRD -> Architecture -> SDD -> Test Plan -> Code
```

## Supported AI Coding Tools

- Cursor
- Claude Code
- Codex
- Qoder
- CodeBuddy
- TRAE

## Installation

Use directly with npm:

```bash
npx @dayahs/ai-project-workflow init . --platform cursor
```

Or install globally:

```bash
npm install -g @dayahs/ai-project-workflow
```

## Quick Start

```bash
npx @dayahs/ai-project-workflow init . --platform cursor
npx @dayahs/ai-project-workflow status .
npx @dayahs/ai-project-workflow validate .
```

With a global install:

```bash
apw init . --platform cursor
apw status .
apw validate .
```

## CLI Commands

```bash
apw init [target]
apw install [target]
apw sync [target]
apw validate [target]
apw status [target]
apw migrate [target]
apw --help
apw --version
```

Supported platforms:

```text
cursor, trae, qoder, codebuddy, claude-code, codex, all
```

By default, the CLI does not overwrite user files. Conflicts are written as `.ai-sdd.new` files. Use `--force` only when overwrite is intended. Use `--dry-run` to preview writes.

## Platform Usage

- Cursor: uses `.cursor/rules/ai-sdd.mdc` with generated Skills and Agents.
- Claude Code: uses `CLAUDE.md` as a lightweight entry point.
- Codex: primarily reads `AGENTS.md` and `core/skills/`.
- Qoder: uses `.qoder/skills/` and `.qoder/agents/`.
- CodeBuddy: uses a minimal compatibility adapter and falls back to `AGENTS.md`.
- TRAE: preserves the slash command convention for the eight stages.

## Project Structure

```text
AGENTS.md
CLAUDE.md
VERSION
bin/
src/
core/
  agents/
  rules/
  schemas/
  skills/
  templates/
adapters/
examples/
test-node/
```

`core/` is the only canonical source. Adapter files should be generated, not manually maintained.

## Workflow State

Target projects use `.ai-workflow/state.json` to track the current stage, completed stages, document status, skipped stages, blockers, and update time.

The schema is located at:

```text
core/schemas/workflow-state.schema.json
```

## Validation

```bash
apw validate .
```

Validation checks required structure, Skill frontmatter, templates, schema JSON, Agent Skill references, residual terms, and adapter synchronization.

## Sync

```bash
apw sync . --platform all
```

Sync regenerates platform adapters from `core/`.

## Migration

```bash
apw migrate .
apw migrate . --apply
```

Migration is dry-run by default. With `--apply`, legacy target-project layouts are moved into a backup folder inside the target project.

## Adding a Skill

1. Add `core/skills/<name>/SKILL.md` with valid YAML frontmatter.
2. Use the standard sections: Goal, Use Cases, Preconditions, Required Context, Inputs, Allowed Changes, Steps, Outputs, Acceptance Criteria, Stop Conditions, Rollback Rules, Completion Report.
3. If the Skill is part of the core stage flow, update `src/lib/constants.js` and tests.
4. Run `apw sync . --platform all`.
5. Run `apw validate .`.

## Adding an Adapter

1. Add generation rules in `src/lib/adapters.js`.
2. Keep `core/` as the canonical source.
3. Mark generated files with `AUTO-GENERATED`.
4. Add or update tests.
5. Run sync and validation.

## Examples

See `examples/minimal-project/` for a minimal target project.

## Requirements

- Node.js >= 20
- npm
- No Python runtime is required

## Known Limitations

- The package provides workflow files and validation logic; it does not replace project-specific engineering judgment.
- Deployment steps depend on the target project's stack and environment.
- Security contact information should be configured by repository maintainers before public issue handling is relied on.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT. See [LICENSE](./LICENSE).
