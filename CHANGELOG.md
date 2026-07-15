# Changelog

All notable changes to AI Project Workflow are documented here.

This project uses npm package versions as release identifiers. Items under Unreleased are not published yet.

## Unreleased

### Added

- WorkflowConfig loading from `.apw/project.yaml`.
- Project-level custom workflow stages.
- Project-level custom Skill lookup under `.apw/skills/<stage>/SKILL.md`.
- Config-aware `init`, `status`, and `validate` behavior while keeping the default eight-stage workflow.
- Configurable workflow example project.

### Compatibility

- Projects without `.apw/project.yaml` continue to use the built-in eight-stage workflow and workflow protocol version `1.0.0`.
- Existing state files that only contain `workflowVersion` remain valid.
- The lightweight YAML parser supports only the documented subset and does not claim full YAML compatibility.

## 0.1.0 - 2026-07-14

### Added

- Pure Node.js/npm CLI.
- Eight-stage AI project workflow.
- Canonical `core/` source for rules, Skills, Agents, templates, and schema.
- Generated adapters for Cursor, Claude Code, Codex, Qoder, CodeBuddy, and TRAE.
- Safe install behavior with `--force` and `--dry-run`.
- Node test suite using `node:test`.
- English and Chinese README files.

## [0.2.0] - 2026-07-15

### Added

- Configurable workflow stages through `.apw/project.yaml`
- Project-level custom Skills under `.apw/skills/<stage>/SKILL.md`
- Config-aware installation, status, and validation
- Configurable workflow example

### Compatibility

- Projects without `.apw/project.yaml` continue to use the default eight-stage workflow
- Existing workflow state files remain supported
