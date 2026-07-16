# AI Project Workflow

[![CI](https://github.com/AlanHuang168/AI-Project-Workflow/actions/workflows/ci.yml/badge.svg)](https://github.com/AlanHuang168/AI-Project-Workflow/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/%40dayahs%2Fai-project-workflow.svg)](https://www.npmjs.com/package/@dayahs/ai-project-workflow)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

[English](./README.md)

一套面向 Cursor、Claude Code、Codex、Qoder、CodeBuddy、CatPaw、TRAE 以及其他 AI 编码助手的通用 AI 原生软件交付工作流。一份规范的 `core/` 单一真相源、每个工具一层轻量适配、一个跟踪进度的状态文件,以及负责安装与校验的 CLI。

## 为什么需要它

当需求、架构、设计和测试还不清晰时,AI 编码助手就急着写代码。结果是:没人要的功能、悄悄扩大的范围,以及从未真正运行过的测试被报告成「全部通过」。

AI Project Workflow 把交付过程显式化:

- 每个阶段都有 Skill 契约:前置条件、允许的改动、产出物、停止条件。
- 每个交付物都必须写入 `docs/` 下的文件,禁止只在对话里打印。
- 进度记录在 `.ai-workflow/state.json` 中,逐阶段设门禁。
- 验证必须诚实报告:真正执行过的命令、真实结果、遗留风险。

## 工作原理

```text
                core/  (唯一规范源)
                ├── rules/       全局工作规则
                ├── skills/      每阶段一份契约
                ├── agents/      角色定义
                ├── templates/   文档骨架
                └── schemas/     状态文件 schema
                        |
        apw init <目标目录> --platform <工具>
                        v
    your-project/
    ├── AGENTS.md, CLAUDE.md            AI 工具读取的入口
    ├── .cursor/ 或 .trae/ 或 ...       适配文件,放在工具真正加载的位置
    └── .ai-workflow/                   APW 内部实现全部收纳于此
        ├── VERSION
        ├── state.json                  工作流状态
        ├── project.yaml                可选的自定义阶段配置
        ├── runtime/                    skills、rules、templates、schemas、agents
        └── adapters/                   平台说明文件
```

APW 将运行时文件收纳在 `.ai-workflow/` 下,让项目根目录保持干净,同时继续兼容旧目录布局。

约束是基于提示词的:适配层指示 AI 先读当前阶段的 Skill、核对上游文档、更新状态文件,然后才能推进。CLI 负责校验文件(`apw validate`、`apw status`);AI 遵守契约是因为每个入口都这样要求它。如果 AI 跑偏了,让它重新阅读 `AGENTS.md`。

> 不会 Node.js、npm 或终端命令？
> 查看[零基础安装指南](./docs/getting-started/beginner-guide.zh-CN.md)。

## 快速开始

```bash
npx @dayahs/ai-project-workflow init . --platform cursor
```

或全局安装:

```bash
npm install -g @dayahs/ai-project-workflow
apw init my-app --platform cursor
```

支持的平台:`cursor`、`trae`、`qoder`、`codebuddy`、`catpaw`、`claude-code`、`codex`、`all`。

## 已验证平台

| 平台 | 状态 | 证据 |
| ---- | ---- | ---- |
| Cursor | ✅ Verified | [Report](./docs/testing/cursor.md) |
| Claude Code | ✅ Verified | [Report](./docs/testing/claude-code.md) |
| Codex CLI | ✅ Verified | [Report](./docs/testing/codex.md) |
| TRAE | ✅ Verified | [Report](./docs/testing/trae.md) |
| CodeBuddy | ✅ Verified | [Report](./docs/testing/codebuddy.md) |
| CatPaw | ⏳ Pending | — |
| Qoder | ⏳ Pending | [Report](./docs/testing/qoder.md) |

完整结果见 [compatibility matrix](./docs/testing/compatibility-matrix.md)。

Qoder 待验证：当前测试账号额度不足，尚未完成真实环境验证。

![Cursor workflow verification](./docs/testing/images/cursor/cursor2.png)

![CodeBuddy Skills and Commands recognized](./docs/testing/images/codebuddy/1.png)

## 端到端:你的第一个项目

安装之后实际会发生什么——以在 Cursor 里做一个待办清单 Web 应用为例。

1. **把工作流装进新项目:**

   ```bash
   npx @dayahs/ai-project-workflow init todo-app --platform cursor
   ```

   `todo-app/` 现在包含 `AGENTS.md`、`CLAUDE.md`、`.cursor/`,以及一个收纳全部 APW 内部实现的 `.ai-workflow/` 目录(runtime、状态文件 `currentStage: "init"` 等)。项目根目录保持干净。

2. **启动第一个阶段。** 在 Cursor 中打开 `todo-app`,对 AI 说:

   ```text
   /prd 我要做一个面向小团队的待办清单 Web 应用
   ```

   `.cursor/rules/ai-sdd.mdc` 规则始终挂载,AI 会先读 `.ai-workflow/runtime/skills/prd/SKILL.md`,先反问澄清,然后把产出写入 `docs/PRD.md` 并更新状态文件。

3. **人工审查与门禁。** 你自己读一遍 `docs/PRD.md`。AI 在每个阶段结束后都会停下;没有你的确认,流程不会前进。

4. **逐阶段继续:** `/hld` 产出 `docs/ARCH.md`,`/sdd` 产出 `docs/SDD.md` 和 `docs/TEST.md`,`/impl` 产出代码与真实的验证运行,`/review` 产出 `docs/REVIEW.md`,然后是 `/deploy` 和 `/retro`。

5. **随时查看进度:**

   ```bash
   apw status .
   apw validate .
   ```

每一步 AI 都必须报告:改动的文件、执行的命令、真实的验证结果、遗留的风险。

## 八个阶段

| 阶段 | 命令 | 读取 | 产出 | 你确认什么 |
|---|---|---|---|---|
| init | `/init` | 你的描述 | 项目骨架、状态文件 | 项目范围 |
| prd | `/prd` | 你的描述 | `docs/PRD.md` | 需求 |
| hld | `/hld` | PRD | `docs/ARCH.md` | 架构 |
| sdd | `/sdd` | PRD、ARCH | `docs/SDD.md`、`docs/TEST.md` | 详细设计 |
| impl | `/impl` | SDD、TEST | 代码 + 验证结果 | 实现 |
| review | `/review` | SDD、代码 | `docs/REVIEW.md` | 问题与修复 |
| deploy | `/deploy` | REVIEW | `docs/DEPLOY.md` | 上线 |
| retro | `/retro` | 全部 | `docs/RETRO.md` | 经验教训 |

**文档优先级——冲突时以谁为准:**

```text
PRD -> Architecture -> SDD -> Test Plan -> Code
```

上游文档是权威。代码与 SDD 不一致时,要么改代码,要么先正式修订 SDD——绝不允许悄悄偏离。阶段只有在你明确批准时才能跳过,跳过及其原因会记录到状态文件的 `skippedStages` 中。

## 可配置工作流

当项目没有 `.ai-workflow/project.yaml` 时,APW 使用内置八阶段:

```text
init -> prd -> hld -> sdd -> impl -> review -> deploy -> retro
```

项目可以在 `.ai-workflow/project.yaml` 中定义阶段顺序(旧路径 `.apw/project.yaml` 仍被兼容):

```yaml
protocolVersion: 1.0.0
stages:
  - init
  - discovery
  - id: build
    title: Build
    description: Build the release candidate
  - review
```

阶段 id 必须以小写字母开头,只能包含小写字母、数字和连字符。重复 id、空 `protocolVersion`、空 `stages` 和未知字段都会被拒绝。

自定义阶段的 Skill 查找顺序:

```text
1. .ai-workflow/skills/<stage>/SKILL.md(旧路径 .apw/skills/ 仍被兼容)
2. 已安装平台中的 Skill
3. .ai-workflow/runtime/skills/<stage>/SKILL.md(本仓库内为 core/skills/)
```

项目级 YAML 解析器只支持这里明确展示的子集:标量 `protocolVersion`、`stages` 列表、字符串阶段 id,以及包含 `id`、`title`、`description` 的对象阶段。它不支持 anchors、aliases、多行块、行内集合或任意深层嵌套。

## 各平台安装说明

每个工具装了什么、如何触发工作流:

| 工具 | 安装的文件 | 加载方式 |
|---|---|---|
| Cursor | `.cursor/rules/ai-sdd.mdc`(始终生效)、`.cursor/skills/`、`.cursor/agents/` | 规则自动挂载到每次对话,并把 AI 指向当前阶段的 Skill。在对话里输入阶段命令(如 `/prd`)。 |
| Claude Code | `CLAUDE.md`、`AGENTS.md`、`.ai-workflow/runtime/` | 会话启动时自动读取 `CLAUDE.md`。 |
| Codex | `AGENTS.md`、`.ai-workflow/runtime/` | Codex 原生读取 `AGENTS.md`。 |
| TRAE | `.trae/rules.md`、`.trae/skills/`、`.trae/agents/` | 把 `.trae/rules.md` 添加为项目规则。TRAE 的自定义智能体在其 UI 中配置——创建时把 `.trae/agents/` 里的角色定义粘贴进去。 |
| Qoder | `.qoder/skills/`、`.qoder/agents/` | 在提示词中引用 Skill 文件,或依赖根目录的 `AGENTS.md`。 |
| CodeBuddy | `.codebuddy/skills/`、`.codebuddy/agents/`、适配说明 | 最小兼容适配;回退到 `AGENTS.md`。 |
| CatPaw | `.catpaw/rules/ai-sdd.md`(ruleType: Always)、`.catpaw/skills/`、`.catpaw/agents/` | Always 规则对每次对话生效,把 AI 指向当前阶段的 Skill。可在 CatPaw 设置里额外开启 CLAUDE.md 与 `.cursor/rules` 兼容获得双保险。 |

Claude Code 已通过自然语言阶段指令完成真实验证，例如输入 `prd` 或“开始 PRD 阶段”。测试环境中未识别 APW 原生斜杠命令，但不影响工作流执行。详见 [Claude Code 报告](./docs/testing/claude-code.md)。

请使用当前工具可接受的阶段触发方式:支持时可使用 `/prd` 这类斜杠形式;不支持时可使用 `prd` 或“开始 PRD 阶段”这类自然语言阶段指令。

## 工作流状态

目标项目通过 `.ai-workflow/state.json` 跟踪进度:

```json
{
  "workflowVersion": "1.0.0",
  "workflowProtocolVersion": "1.0.0",
  "workflowStages": ["init", "prd", "hld", "sdd", "impl", "review", "deploy", "retro"],
  "projectName": "todo-app",
  "currentStage": "sdd",
  "completedStages": ["init", "prd", "hld"],
  "blocked": false,
  "blockReason": "",
  "documents": { "prd": "complete", "arch": "complete", "sdd": "draft" },
  "skippedStages": [
    { "stage": "deploy", "reason": "库项目,无需部署", "approvedByUser": true }
  ],
  "lastUpdatedAt": "2026-07-14T12:00:00.000Z"
}
```

schema 在已安装项目中位于 `.ai-workflow/runtime/schemas/workflow-state.schema.json`(本仓库内为 `core/schemas/`)。AI 在每个阶段结束时更新此文件;`apw status` 负责读取展示。

## CLI 参考

```bash
apw init [target] --platform <tool>   # 需要时创建目标目录,然后安装
apw install [target] --platform <tool># 向已有目录安装工作流文件
apw sync [target] [--platform <tool>] # 从 core/ 重新生成适配文件
apw validate [target]                 # 校验结构、配置、frontmatter、状态、适配同步
apw status [target]                   # 打印工作流状态与已安装平台
apw migrate [target] [--apply]        # 迁移旧目录布局(默认只预览)
apw --help
apw --version
```

安全行为:

- 绝不覆盖用户已有文件。冲突会在原文件旁生成 `.ai-sdd.new` 供你对比。
- `--force` 表示有意覆盖;`--dry-run` 预览所有写入而不落盘。
- 生成的适配文件带 `AUTO-GENERATED` 标记;要改请改 `core/` 然后运行 `apw sync`。

## 常见问题

**AI 无视工作流,直接开始写代码。**
让它先读 `AGENTS.md` 和当前阶段的 Skill 再继续。确认适配层真的被加载了(Cursor:对话上下文中出现 `ai-sdd` 规则)。约束是基于提示词的,偶尔需要人工拉回是正常的。

**能跳过某个阶段吗,比如 deploy?**
可以——明确说出来即可。AI 会把跳过及你的理由记录到 `skippedStages`,后续阶段视其为已批准。

**同一个项目能同时用两个工具吗?**
可以。用 `--platform all` 安装(或对另一个平台再跑一次 `apw install`)。各适配层目录独立,互不干扰。

**包发新版后如何升级?**
更新包,然后在项目里重新运行 `apw install .`——你改过的文件会被保留,新内容以 `.ai-sdd.new` 出现。之后运行 `apw validate .`。旧布局项目(`core/` 在项目根)用 `apw migrate . --apply` 一键升级到收纳布局。

**某个阶段做坏了,怎么回退?**
每个 Skill 都定义了回退规则:设计无法实现回 `sdd`,架构边界错了回 `hld`,需求缺失回 `prd`。先修订上游文档,再重跑下游阶段。

## 与同类方案的对比

- **GitHub Spec Kit** 聚焦规格优先开发,阶段更少。AI Project Workflow 增加了多工具适配、机器可读的状态文件和安装/校验 CLI。
- **BMAD-METHOD** 以丰富的多智能体角色扮演为核心。AI Project Workflow 保持角色轻量,把契约放进单个智能体就能执行的分阶段 Skill 里。
- **纯规则文件**(单个 `AGENTS.md` 或规则文档)只能陈述原则,无法设阶段门禁、跟踪状态。本项目补上了分阶段契约、文档模板、状态跟踪与校验。

## 项目结构

```text
AGENTS.md            原生读取该文件的智能体入口
CLAUDE.md            Claude Code 的轻量入口
VERSION
bin/                 CLI 入口
src/                 CLI 实现
core/                规范源:规则、Skill、智能体、模板、schema
adapters/            生成的适配树,每平台一份
examples/            最小目标项目
examples/configurable-workflow/
test-node/           测试套件(node --test)
```

`core/` 是本仓库的唯一规范源;已安装项目中同样的内容位于 `.ai-workflow/runtime/`。适配文件是生成物——改 `core/` 后运行 `apw sync . --platform all`。

## 扩展

**新增 Skill:** 创建 `core/skills/<name>/SKILL.md`,带标准 frontmatter 与章节(Goal、Preconditions、Steps、Outputs、Acceptance Criteria、Stop Conditions、Rollback Rules、Completion Report)。若加入核心阶段流,需同步更新 `src/lib/constants.js` 与测试。然后运行 `apw sync . --platform all` 和 `apw validate .`。

**新增项目阶段:** 创建 `.apw/project.yaml`,再为每个自定义阶段添加 `.apw/skills/<stage>/SKILL.md`。让 AI 跟随自定义流程前,先运行 `apw validate .`。

**新增适配器:** 在 `src/lib/adapters.js` 中添加生成规则,保持 `core/` 为规范源,生成文件标记 `AUTO-GENERATED`,补测试,然后同步并校验。

完整贡献指南见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 环境要求

- Node.js >= 20 与 npm。不需要其他运行时。

## 已知限制

- 约束是基于提示词的:CLI 校验文件与状态,但让 AI 遵守流程的是工具侧的上下文(规则、入口文件)。偶尔需要人工把 AI 拉回流程。
- 工作流提供结构与校验,不能替代项目本身的工程判断。
- 部署步骤取决于目标项目的技术栈与环境。

## 参与贡献

见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 更新日志

见 [CHANGELOG.md](./CHANGELOG.md)。

## 许可证

MIT,见 [LICENSE](./LICENSE)。
