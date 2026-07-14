# AI Project Workflow

## Workflow Stages

init -> prd -> hld -> sdd -> impl -> review -> deploy -> retro

## Document Priority

PRD -> Architecture -> SDD -> Test Plan -> Code

## Mandatory Rules

- Read the relevant Skill before starting a stage.
- Verify that required upstream artifacts exist and are not empty.
- Write every deliverable to the actual project files.
- Do not implement business behavior that is not defined in the approved SDD.
- Stop and ask the user when requirements are ambiguous.
- Never report unexecuted tests as passed.
- Report failed commands and incomplete work honestly.
- Do not run commit, push, merge, rebase, or force push without explicit user approval.
- Do not modify files outside the current task scope.
- Update `.ai-workflow/state.json` after a stage is completed.

## Skill Location

`core/skills/<stage>/SKILL.md`

## Completion Report

- Current stage
- Modified files
- Generated documents
- Commands executed
- Verification results
- Incomplete work
- Risks
- Next stage
