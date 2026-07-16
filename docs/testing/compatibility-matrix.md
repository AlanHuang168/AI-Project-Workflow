# Compatibility Matrix

Last updated: 2026-07-16

This matrix summarizes real-environment compatibility checks for AI Project Workflow. Platform versions are listed as "Latest available version at test time" unless the screenshot evidence clearly shows a version.

| Platform | Install | Adapter Files | Skill/Rule Loading | Workflow Test | Status | Last Verified |
| -------- | ------: | ------------: | -----------------: | ------------: | ------ | ------------- |
| Cursor | ✅ | ✅ | ✅ | ✅ | Verified | 2026-07-15 |
| Claude Code | ✅ | ✅ | ✅ | ✅ | Verified | 2026-07-15 |
| Codex CLI | ✅ | ✅ | ✅ | ✅ | Verified | 2026-07-15 |
| TRAE | ✅ | ✅ | ✅ | ✅ | Verified | 2026-07-15 |
| CodeBuddy | ✅ | ✅ | ✅ | ✅ | Verified | 2026-07-15 |
| CatPaw | ✅ | ✅ | ✅ | ✅ | Verified | 2026-07-16 |
| Qoder | Not fully verified | Generated | Pending | Pending | Pending | Pending |

## Notes

- Qoder is pending real-environment verification because the current test account has no remaining usage credits.
- Generated adapter files are still included for Qoder; live Skill/rule loading and workflow execution remain pending.
> Claude Code was verified through natural-language stage invocation. Native APW slash commands were not recognized in the tested environment.
- See the per-platform reports for screenshots and known issues:
  - [Cursor](./cursor.md)
  - [Claude Code](./claude-code.md)
  - [Codex CLI](./codex.md)
  - [TRAE](./trae.md)
  - [CodeBuddy](./codebuddy.md)
  - [CatPaw](./catpaw.md)
  - [Qoder](./qoder.md)
