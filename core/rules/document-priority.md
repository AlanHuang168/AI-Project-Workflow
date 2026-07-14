# Document Priority

The project uses the following document priority:

```text
PRD -> Architecture -> SDD -> Test Plan -> Code
```

When artifacts conflict:

- PRD defines business goals, users, scope, non-goals, and acceptance criteria.
- Architecture defines system boundaries, components, technology choices, data flow, and deployment topology.
- SDD defines interfaces, data structures, database design, state transitions, error handling, and implementation order.
- Test Plan defines verification coverage and acceptance mapping.
- Code may only implement approved behavior. It must not expand requirements backward.

If implementation reveals a conflict in upstream documents, stop and ask the user which artifact is authoritative. Do not present assumptions as facts.
