# Contributing

Thank you for contributing to AI Project Workflow.

## Development Setup

```bash
npm install
```

Use Node.js 20 or newer.

## Running Tests

```bash
npm test
node bin/apw.js validate .
```

## Adding a Skill

1. Add the Skill under `core/skills/<name>/SKILL.md`.
2. Use the standard Skill sections.
3. Keep the content in English.
4. Update tests when behavior or validation changes.

## Adding an Adapter

1. Update generation logic in `src/lib/adapters.js`.
2. Keep platform-specific files generated from `core/`.
3. Add tests for new generated behavior.

## Pull Request Expectations

- Keep changes focused.
- Include tests for behavior changes.
- Report commands that were run.
- Report commands that failed.
- Do not include generated artifacts that are out of sync.

## No Generated Adapter Edits

Do not edit generated adapter files directly. Change the canonical source in `core/` or generation logic in `src/lib/adapters.js`, then sync adapters.

## How to Sync Adapters

```bash
node bin/apw.js sync . --platform all
node bin/apw.js validate .
```
