# Changelog

All notable changes to AI Project Workflow are documented here.

This project uses npm package versions as release identifiers. Items under Unreleased are not published yet.

## Unreleased

No unreleased changes yet.

## [0.2.0] - 2026-07-15

### Added

- Configurable workflows through `.apw/project.yaml`
- Project-level custom Skills
- Real-environment compatibility reports
- Compatibility matrix and platform screenshots
- Config-aware installation, status, and validation
- Configurable workflow example

### Verified

- Cursor
- Claude Code
- Codex CLI
- TRAE
- CodeBuddy

### Pending

- Qoder real-environment verification

### Compatibility

- Projects without `.apw/project.yaml` continue to use the default eight-stage workflow
- Existing workflow state files remain supported
- Workflow protocol version remains `1.0.0`

## 0.1.0 - 2026-07-14

### Added

- Pure Node.js/npm CLI.
- Eight-stage AI project workflow.
- Canonical `core/` source for rules, Skills, Agents, templates, and schema.
- Generated adapters for Cursor, Claude Code, Codex, Qoder, CodeBuddy, and TRAE.
- Safe install behavior with `--force` and `--dry-run`.
- Node test suite using `node:test`.
- English and Chinese README files.
