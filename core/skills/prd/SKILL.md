---
name: prd
description: Clarify users, context, goals, scope, non-goals, requirements, and acceptance criteria, then produce docs/PRD.md. Use when the user asks for product requirements or invokes /prd.
version: 1.0.0
stage: prd
---

# Goal

Turn unclear product or project input into a structured PRD that can be reviewed and accepted.

# Use Cases

- The user invokes `/prd`.
- The user provides business context, a product idea, or a requirements draft.
- The user asks to create or refine product requirements.

# Preconditions

- `.ai-workflow/state.json` exists.
- `init` is complete unless the user explicitly approves a skip and the reason is recorded.
- Do not move directly into architecture or implementation.

# Required Context

- `AGENTS.md`
- `.ai-workflow/state.json`
- `core/rules/document-priority.md`
- `core/templates/PRD.template.md`
- Existing `docs/PRD.md`, if present
- User-provided requirement materials

# Inputs

- Project background, target users, use cases, feature ideas, and constraints.
- If information is insufficient, ask up to five required clarification questions and wait for the user.

# Allowed Changes

- `docs/PRD.md`
- `.ai-workflow/state.json`
- Do not modify code.

# Steps

1. Check workflow state and confirm that `init` is complete.
2. Read user input and existing `docs/PRD.md`, if present.
3. Clarify goals, users, use cases, scope, non-goals, acceptance criteria, and risks.
4. Rewrite requirements into a structured PRD. Do not copy raw notes without synthesis.
5. Assign P0/P1/P2 priority and map each P0 feature to a user story.
6. Cover performance, security, compatibility, maintainability, and usability requirements.
7. Write `docs/PRD.md`.
8. Update workflow state: `documents.prd = "complete"`, add `prd` to `completedStages`, set `currentStage = "hld"`, and update the timestamp.
9. If state update fails, do not report the stage as complete.

# Outputs

- `docs/PRD.md`
- Updated `.ai-workflow/state.json`

# Acceptance Criteria

- PRD includes background, goals, users, use cases, scope, non-goals, functional requirements, non-functional requirements, acceptance criteria, risks, and open questions.
- It includes at least three core user stories, or explains why fewer are sufficient.
- Every P0 feature has acceptance criteria.
- Out-of-scope items are explicit.

# Stop Conditions

- The core goal is unclear and the user has not answered clarification questions.
- The user asks for implementation work.
- Workflow state is missing and the user does not approve init first.

# Rollback Rules

- If new requirements appear after PRD completion, revise the PRD before entering `hld`.
- If requirements conflict, use the latest explicit user answer and record open questions.

# Completion Report

Report the current stage, modified files, generated documents, commands executed, verification results, incomplete work, risks, and next stage `hld`.
