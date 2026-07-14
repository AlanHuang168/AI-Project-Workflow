# AI Project Workflow

[English](./README.md)

## Project Overview

AI Project Workflow 是一套面向 Cursor、Claude Code、Codex、Qoder、CodeBuddy、TRAE 以及其他 AI 编码助手的通用 AI 原生项目工作流。它以 `core/` 作为唯一真实源，并为不同工具生成轻量适配层。

## Why AI Project Workflow

当需求、架构、设计和测试不清晰时，AI 编码助手很容易过快进入实现。这个工作流把每个阶段显式化，将产物写入文件，跟踪状态，并要求诚实报告验证结果。

## Key Features

- 从初始化到复盘的八阶段工作流。
- 以 `core/` 为中心管理规则、Skills、Agents、模板和 schema。
- 从唯一真实源生成平台适配器。
- 默认不覆盖用户文件，只有使用 `--force` 才覆盖。
- 纯 Node.js CLI，不需要 Python。

## Workflow Stages

```text
init -> prd -> hld -> sdd -> impl -> review -> deploy -> retro
```

文档优先级：

```text
PRD -> Architecture -> SDD -> Test Plan -> Code
```

## Supported AI Coding Tools

- Cursor
- Claude Code
- Codex
- Qoder
- CodeBuddy
- TRAE

## Installation

直接使用 npm：

```bash
npx @dayahs/ai-project-workflow init . --platform cursor
```

或全局安装：

```bash
npm install -g @dayahs/ai-project-workflow
```

## Quick Start

```bash
npx @dayahs/ai-project-workflow init . --platform cursor
npx @dayahs/ai-project-workflow status .
npx @dayahs/ai-project-workflow validate .
```

全局安装后：

```bash
apw init . --platform cursor
apw status .
apw validate .
```

## CLI Commands

```bash
apw init [target]
apw install [target]
apw sync [target]
apw validate [target]
apw status [target]
apw migrate [target]
apw --help
apw --version
```

支持的平台：

```text
cursor, trae, qoder, codebuddy, claude-code, codex, all
```

默认情况下，CLI 不会覆盖用户文件。冲突文件会写成 `.ai-sdd.new`。只有确认需要覆盖时才使用 `--force`。使用 `--dry-run` 可以预览写入计划。

## Platform Usage

- Cursor：使用 `.cursor/rules/ai-sdd.mdc` 以及生成的 Skills 和 Agents。
- Claude Code：使用 `CLAUDE.md` 作为轻量入口。
- Codex：主要读取 `AGENTS.md` 和 `core/skills/`。
- Qoder：使用 `.qoder/skills/` 和 `.qoder/agents/`。
- CodeBuddy：使用最低兼容适配器，并可回退到 `AGENTS.md`。
- TRAE：保留八阶段斜杠命令习惯。

## Project Structure

```text
AGENTS.md
CLAUDE.md
VERSION
bin/
src/
core/
  agents/
  rules/
  schemas/
  skills/
  templates/
adapters/
examples/
test-node/
```

`core/` 是唯一真实源。适配器文件应由工具生成，不应手工维护。

## Workflow State

目标项目使用 `.ai-workflow/state.json` 跟踪当前阶段、已完成阶段、文档状态、跳过阶段、阻塞信息和更新时间。

schema 位于：

```text
core/schemas/workflow-state.schema.json
```

## Validation

```bash
apw validate .
```

验证会检查必要结构、Skill frontmatter、模板、schema JSON、Agent 的 Skill 引用、残留术语以及适配器同步状态。

## Sync

```bash
apw sync . --platform all
```

同步会从 `core/` 重新生成平台适配器。

## Migration

```bash
apw migrate .
apw migrate . --apply
```

迁移默认是 dry-run。使用 `--apply` 时，目标项目中的旧布局会移动到该目标项目内的备份目录。

## Adding a Skill

1. 在 `core/skills/<name>/SKILL.md` 添加合法 YAML frontmatter。
2. 使用标准章节：Goal、Use Cases、Preconditions、Required Context、Inputs、Allowed Changes、Steps、Outputs、Acceptance Criteria、Stop Conditions、Rollback Rules、Completion Report。
3. 如果该 Skill 属于核心阶段流程，更新 `src/lib/constants.js` 和测试。
4. 运行 `apw sync . --platform all`。
5. 运行 `apw validate .`。

## Adding an Adapter

1. 在 `src/lib/adapters.js` 添加生成规则。
2. 保持 `core/` 作为唯一真实源。
3. 为生成文件添加 `AUTO-GENERATED` 标记。
4. 新增或更新测试。
5. 运行同步和验证。

## Examples

参见 `examples/minimal-project/`。

## Requirements

- Node.js >= 20
- npm
- 不需要 Python 运行时

## Known Limitations

- 本包提供工作流文件和验证逻辑，但不能替代具体项目中的工程判断。
- 部署步骤取决于目标项目的技术栈和环境。
- 维护者应在公开处理安全问题前配置安全联系方式。

## Contributing

参见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## License

MIT。参见 [LICENSE](./LICENSE)。
