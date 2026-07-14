---
name: hld
description: Create high-level architecture from the approved PRD, including system context, components, technology choices, data flow, dependencies, deployment topology, and risks. Use when the user asks for architecture or invokes /hld.
version: 1.0.0
stage: hld
---

# Goal

Convert approved product requirements into a reviewable architecture document, `docs/ARCH.md`.

# Use Cases

- The user invokes `/hld`.
- The user asks to create architecture.
- The PRD is approved and the project needs system boundaries and technical direction.

# Preconditions

- `docs/PRD.md` exists and is not empty.
- Workflow state shows `prd` complete unless the user explicitly approves a skip and the reason is recorded.

# Required Context

- `AGENTS.md`
- `.ai-workflow/state.json`
- `core/rules/document-priority.md`
- `core/templates/ARCH.template.md`
- `docs/PRD.md`
- Existing `docs/ARCH.md`, if present

# Inputs

- Approved PRD.
- User-provided technical constraints such as language, framework, database, or deployment environment.

# Allowed Changes

- `docs/ARCH.md`
- `.ai-workflow/state.json`
- Do not write business code.

# Steps

1. Confirm that the PRD exists and is not empty.
2. Extract P0 features, non-functional requirements, non-goals, and risks.
3. Define system context, components, technology choices, and key alternatives.
4. Describe data flow, external dependencies, deployment topology, security approach, and performance constraints.
5. List interface contracts at a high level without implementing them.
6. Confirm that all P0 requirements are covered by the architecture.
7. Write `docs/ARCH.md`.
8. Update workflow state: `documents.arch = "complete"`, add `hld` to `completedStages`, set `currentStage = "sdd"`, and update the timestamp.

# Outputs

- `docs/ARCH.md`
- Updated `.ai-workflow/state.json`

# Acceptance Criteria

- ARCH covers all P0 features from the PRD.
- It includes system context, components, technology choices, data flow, deployment topology, external dependencies, security, performance, and risks.
- Technology choices include rationale and key alternatives.
- It does not include business implementation code.

# Stop Conditions

- PRD is missing or empty.
- P0 requirements conflict and architecture boundaries cannot be determined.
- The user asks to skip architecture without approving a recorded skip.

# Rollback Rules

- If PRD requirements are missing, return to `prd`.
- If architecture review changes technology choices, revise ARCH before entering `sdd`.

# Completion Report

Report the current stage, modified files, generated documents, commands executed, verification results, incomplete work, risks, and next stage `sdd`.
