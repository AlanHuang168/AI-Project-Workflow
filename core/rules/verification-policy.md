# Verification Policy

- Never report unexecuted tests as passed.
- Failed commands must be reported with the command, exit code, and key error details.
- If the environment prevents verification, report the missing condition and the reproducible next step.
- Verification results must be included in the completion report.
- The implementation stage must attempt at least one suitable build, test, or static check.
- The review stage must check document consistency, security, performance, maintainability, and test completeness.
