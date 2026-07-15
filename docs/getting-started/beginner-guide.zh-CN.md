# 零基础使用指南

这份指南适合第一次接触 Node.js、npm、终端和 AI 编码工具的用户。

请按顺序操作。使用 APW 不要求你会 JavaScript。

## AI Project Workflow 是什么

AI Project Workflow,简称 APW,是一套配合 AI 编码工具使用的软件开发流程。

它会引导你完成八个阶段:

```text
init -> prd -> hld -> sdd -> impl -> review -> deploy -> retro
```

每个阶段都会告诉 AI 应该读取什么、询问什么、生成什么,以及什么时候停下来让你确认。

## 使用前准备

你需要:

- 一台可以联网的电脑。
- Node.js 20 或更高版本。
- 一个终端。
- 一个 AI 编码工具,例如 Cursor、Claude Code、Codex、TRAE、Qoder 或 CodeBuddy。

Node.js 只是用于运行 APW 安装工具。
使用 APW 不要求你会 JavaScript。

## 第一步：安装 Node.js

从官网安装 Node.js:

```text
https://nodejs.org/
```

选择当前 LTS 版本。确认它是 Node.js 20 或更高版本。

安装完成后,关闭并重新打开终端。

检查 Node.js 和 npm 是否可用:

```bash
node --version
npm --version
```

只要两个命令都输出版本号,就说明准备好了。

## 第二步：打开终端

终端命令必须输入到终端中，不要输入到 AI 聊天框。

Windows 可以使用:

- PowerShell
- Windows Terminal
- Cursor 或 VS Code 的内置终端

macOS 可以使用:

- Terminal
- Cursor 或 VS Code 的内置终端

Linux 请打开系统里的 Terminal 应用。

## 第三步：创建项目文件夹

在终端中运行:

```bash
mkdir my-first-ai-project
cd my-first-ai-project
```

`mkdir` 的意思是“创建文件夹”。
`cd` 的意思是“进入文件夹”。

执行 `cd my-first-ai-project` 后,你的终端就在新项目文件夹里了。

## 第四步：安装 APW

以 Cursor 为例,在终端中运行:

```bash
npx @dayahs/ai-project-workflow init . --platform cursor
```

每一部分的含义:

| 部分 | 含义 |
| ---- | ---- |
| `npx` | 临时下载并运行一个工具。 |
| `@dayahs/ai-project-workflow` | APW 在 npm 上的包名。 |
| `init` | 在项目里创建 APW 工作流文件。 |
| `.` | 当前文件夹。 |
| `--platform cursor` | 安装 Cursor 需要的文件。 |

你不需要全局安装 APW。

第一次运行可能会稍慢,因为 `npx` 需要下载包。

其他平台参数:

| Platform | Command |
| -------- | ------- |
| Cursor | `--platform cursor` |
| Claude Code | `--platform claude-code` |
| Codex | `--platform codex` |
| TRAE | `--platform trae` |
| Qoder | `--platform qoder` |
| CodeBuddy | `--platform codebuddy` |

Qoder 这里只说明安装参数。兼容性报告中尚未把它标记为完整真实验证通过。

## 第五步：使用 AI 编码工具打开项目

以 Cursor 为例:

```text
Open Cursor.
Select File -> Open Folder.
Choose my-first-ai-project.
```

如果你的电脑上可以使用 `cursor` 命令,也可以在终端中运行:

```bash
cursor .
```

如果这个命令不可用,直接用 Cursor 界面打开文件夹即可。

## 第六步：执行第一个工作流阶段

聊天阶段指令要输入到 AI 聊天框,不要输入到终端。

在 Cursor 中,可以在 AI 聊天框输入:

```text
/init Create a simple calculator web application.
```

有些工具支持原生斜杠命令。
有些工具使用自然语言阶段指令。

例如 PRD 阶段可以用:

```text
/prd
```

也可以用:

```text
prd
Start the PRD stage.
```

如果 Claude Code 不识别 `/prd`,请输入 `prd` 或 `Start the PRD stage`。

## 第七步：继续后续阶段

一次只推进一个阶段:

```text
/prd
/hld
/sdd
/impl
/review
/deploy
/retro
```

每个阶段完成后,先阅读生成的文档。

确认没有问题后,再让 AI 进入下一阶段。

不需要一次执行全部阶段。

## 查看项目状态

在终端中运行:

```bash
npx @dayahs/ai-project-workflow status .
```

它会显示当前工作流阶段和已安装的平台文件。

只有全局安装 APW 之后,才能直接使用较短的 `apw status .` 命令。

## 验证安装结果

在终端中运行:

```bash
npx @dayahs/ai-project-workflow validate .
```

它会检查 APW 文件是否安装正确。

只有全局安装 APW 之后,才能直接使用较短的 `apw validate .` 命令。

## 常见问题

### `node: command not found`

Node.js 没有安装,或者终端是在安装 Node.js 之前打开的。

请安装 Node.js,然后关闭并重新打开终端。

### `npm` / `npx` command not found

请重新安装 Node.js,并重新打开终端。

Node.js 会一起安装 npm 和 npx。

### `apw: command not found`

你可能没有全局安装 APW。

请优先使用:

```bash
npx @dayahs/ai-project-workflow status .
```

或者全局安装 APW:

```bash
npm install -g @dayahs/ai-project-workflow
```

### `Unknown command: /prd`

你的 AI 编码工具可能不支持原生斜杠命令。

请使用自然语言阶段指令:

```text
prd
```

或:

```text
Start the PRD stage.
```

### 网络失败

请检查网络连接。

然后重新运行 `npx @dayahs/ai-project-workflow ...` 命令。

### 文件已存在或冲突

APW 默认不会覆盖你的已有文件。

如果文件已经存在,APW 可能会在旁边生成 `.ai-sdd.new` 文件。

请先对比文件内容,再决定保留哪一个。

## 下一步

建议从小项目开始,例如计算器、待办清单或个人笔记应用。

每个阶段完成后,都先阅读生成的文档。

熟悉之后,可以继续阅读主 [README](../../README.zh-CN.md) 和 [平台兼容性报告](../testing/compatibility-matrix.md)。
