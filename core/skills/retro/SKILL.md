---
name: retro
description: Summarize outcomes, deviations, root causes, reusable assets, and improvement actions. Use when the project is complete, when delivery needs a retrospective, or when the user invokes /retro.
version: 1.0.0
stage: retro
---

# Goal

Review the full workflow and capture outcomes, deviations, root causes, reusable assets, and improvements for the next iteration.

# Use Cases

- The user invokes `/retro`.
- The user asks for a project retrospective.
- The project needs a delivery summary.

# Preconditions

- `deploy` is complete, or the user explicitly approves skipping deployment and records the reason.
- Upstream documents and code are readable.

# Required Context

- `AGENTS.md`
- `.ai-workflow/state.json`
- `core/templates/RETRO.template.md`
- `docs/PRD.md`
- `docs/ARCH.md`
- `docs/SDD.md`
- `docs/TEST.md`
- `docs/REVIEW.md`
- `docs/DEPLOY.md`, if present
- Relevant source and test files

# Inputs

- Full project context.
- User feedback about results, quality, time, and risk.

# Allowed Changes

- `docs/RETRO.md`
- `.ai-workflow/state.json`
- Optional candidate improvements for team rules, but only after user confirmation.

# Steps

1. Read workflow state, upstream documents, review report, deployment guide, and code.
2. Summarize completed and incomplete work.
3. Compare plan versus actual outcome and analyze root causes.
4. Record what went well, problems, improvement actions, and reusable assets.
5. Identify next-version recommendations and priorities.
6. Write `docs/RETRO.md`.
7. Update workflow state: `documents.retro = "complete"`, add `retro` to `completedStages`, set `currentStage = "retro"`, and update the timestamp.

# Outputs

- `docs/RETRO.md`
- Updated `.ai-workflow/state.json`

# Acceptance Criteria

- RETRO includes outcome, plan versus actual, what went well, problems and root causes, improvement actions, and reusable assets.
- Incomplete work and deviations are recorded honestly.
- The retrospective is not only praise or a chronological log.

# Stop Conditions

- Critical context is missing and real deviations cannot be judged.
- The user asks to hide failures or risks.

# Rollback Rules

- If the retrospective finds a blocking defect, return to the appropriate stage before finalizing.
- If deployment was skipped, record the reason in workflow state and RETRO.

# Completion Report

Report the current stage, modified files, generated documents, commands executed, verification results, incomplete work, risks, and final workflow status.
