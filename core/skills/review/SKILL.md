---
name: review
description: Review consistency between PRD, Architecture, SDD, Test Plan, and code. Identify scope creep, missed requirements, security, performance, maintainability, and test issues. Use when entering review or invoking /review.
version: 1.0.0
stage: review
---

# Goal

Review the implementation against the approved documents and produce an actionable review report.

# Use Cases

- The user invokes `/review`.
- The user asks to check whether code matches design.
- Implementation is complete and the project is entering release readiness checks.

# Preconditions

- `impl` is complete.
- PRD, Architecture, SDD, Test Plan, and relevant code are readable.

# Required Context

- `AGENTS.md`
- `.ai-workflow/state.json`
- `core/templates/REVIEW.template.md`
- `docs/PRD.md`
- `docs/ARCH.md`
- `docs/SDD.md`
- `docs/TEST.md`
- Relevant source and test files

# Inputs

- Current implementation.
- Upstream documents.
- Existing `docs/REVIEW.md`, if present.

# Allowed Changes

- `docs/REVIEW.md`
- `.ai-workflow/state.json`
- By default, do not modify code.

# Steps

1. Read upstream documents and code.
2. Check consistency across PRD, Architecture, SDD, Test Plan, and code.
3. Identify scope creep and missed requirements.
4. Check security, performance, maintainability, error handling, and test completeness.
5. Classify issues as blocking or non-blocking and provide remediation advice.
6. Write `docs/REVIEW.md`.
7. If blocking issues exist, keep `currentStage = "review"` and record `blocked = true` with the reason.
8. If no blocking issues exist, add `review` to `completedStages`, set `currentStage = "deploy"`, and update the timestamp.

# Outputs

- `docs/REVIEW.md`

# Acceptance Criteria

- The report includes review summary, blocking issues, non-blocking issues, document consistency, code quality, test coverage, security risks, and release recommendation.
- Every blocking issue includes file location, impact, and remediation advice.
- No unverified claim is reported as passed.

# Stop Conditions

- Required upstream documents or code are missing and consistency cannot be judged.
- The user asks to fix code during review without explicitly changing the task scope.

# Rollback Rules

- After blocking issues are fixed, run review again.
- If an issue comes from the SDD, return to `sdd`.

# Completion Report

Report the current stage, modified files, generated documents, commands executed, verification results, incomplete work, risks, and next stage `deploy` or the stage to return to.
