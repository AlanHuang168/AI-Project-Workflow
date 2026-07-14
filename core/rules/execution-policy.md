# Execution Policy

- The AI coding agent should read the active Skill, workflow state, and required upstream artifacts before acting.
- Every deliverable must be written to project files. Do not deliver only in chat.
- Do not create files outside the current task scope.
- Do not modify business code unrelated to the active stage.
- Describe generic capabilities as reading files, running commands, editing files, or asking the user. Do not depend on a specific tool brand.
- Stop and ask a clear question when requirements, design, or acceptance criteria are ambiguous.
- Do not require a fixed model.
- Do not run commit, push, merge, rebase, or force push automatically.
