# Workflow Rules

AI Project Workflow uses these fixed stages:

```text
init -> prd -> hld -> sdd -> impl -> review -> deploy -> retro
```

Do not change the meaning of core stages. If the user asks for a new stage, treat it as an extension Skill or adapter note. Do not insert it into the core dependency chain.

Default dependencies:

| Stage | Depends on |
| --- | --- |
| init | none |
| prd | init |
| hld | prd |
| sdd | hld |
| impl | sdd |
| review | impl |
| deploy | review |
| retro | deploy |

The user may explicitly approve skipping non-required stages, but the skip must be written to `.ai-workflow/state.json` under `skippedStages` with the reason.

Before a stage is complete, confirm that:

- Required upstream files were read and are not empty.
- Stage deliverables were written to files.
- Workflow state was updated successfully.
- The completion report includes real commands and verification results.
