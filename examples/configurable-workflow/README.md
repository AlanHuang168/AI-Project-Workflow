# Configurable Workflow Example

This example shows a project-level workflow configuration with custom stages.

The configured order is:

```text
init -> discovery -> build -> review
```

APW reads the workflow from `.apw/project.yaml`:

```yaml
protocolVersion: 1.0.0
stages:
  - init
  - discovery
  - build
  - review
```

The custom stages provide their Skills at:

```text
.apw/skills/discovery/SKILL.md
.apw/skills/build/SKILL.md
```

Default stages such as `init` and `review` can still use package-provided core Skills. Custom stages must provide a project Skill or an installed platform Skill; APW does not generate placeholder Skills for custom stages.

Try it from the example directory:

```bash
apw init . --platform cursor
apw status .
apw validate .
```
