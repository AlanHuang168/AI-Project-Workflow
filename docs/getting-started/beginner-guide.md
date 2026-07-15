# Beginner Guide

This guide is for people who are new to Node.js, npm, terminals, and AI coding tools.

Follow the steps in order. You do not need to learn JavaScript to use APW.

## What is AI Project Workflow?

AI Project Workflow, or APW, is a guided process for building software with AI coding tools.

It helps you move through eight stages:

```text
init -> prd -> hld -> sdd -> impl -> review -> deploy -> retro
```

Each stage tells the AI what to read, what to ask, what to create, and when to stop for your review.

## What You Need

You need:

- A computer with internet access.
- Node.js 20 or higher.
- A terminal.
- An AI coding tool such as Cursor, Claude Code, Codex, TRAE, Qoder, or CodeBuddy.

Node.js is required to run the APW installer.
You do not need to learn JavaScript to use APW.

## Step 1: Install Node.js

Install Node.js from the official website:

```text
https://nodejs.org/
```

Choose the current LTS version. Make sure it is Node.js 20 or higher.

After installation, close and reopen your terminal.

Check that Node.js and npm are available:

```bash
node --version
npm --version
```

If both commands print version numbers, you are ready.

## Step 2: Open a Terminal

Terminal commands must be entered in the terminal, not in the AI chat box.

On Windows, you can use:

- PowerShell
- Windows Terminal
- The built-in terminal in Cursor or VS Code

On macOS, you can use:

- Terminal
- The built-in terminal in Cursor or VS Code

On Linux, open your Terminal app.

## Step 3: Create a Project Folder

Run these commands in your terminal:

```bash
mkdir my-first-ai-project
cd my-first-ai-project
```

`mkdir` means "create a folder".
`cd` means "enter the folder".

After `cd my-first-ai-project`, your terminal is inside your new project folder.

## Step 4: Install APW

For Cursor, run this command in your terminal:

```bash
npx @dayahs/ai-project-workflow init . --platform cursor
```

What each part means:

| Part | Meaning |
| ---- | ------- |
| `npx` | Temporarily downloads and runs a tool. |
| `@dayahs/ai-project-workflow` | The APW package name on npm. |
| `init` | Creates the APW workflow files in a project. |
| `.` | The current folder. |
| `--platform cursor` | Installs files for Cursor. |

You do not need to install APW globally.

The first run may take a little longer because `npx` downloads the package.

Other platform options:

| Platform | Command |
| -------- | ------- |
| Cursor | `--platform cursor` |
| Claude Code | `--platform claude-code` |
| Codex | `--platform codex` |
| TRAE | `--platform trae` |
| Qoder | `--platform qoder` |
| CodeBuddy | `--platform codebuddy` |

Qoder is listed as an install option. It is not marked as fully verified in the compatibility reports yet.

## Step 5: Open the Project in Your AI Coding Tool

For Cursor:

```text
Open Cursor.
Select File -> Open Folder.
Choose my-first-ai-project.
```

If the `cursor` command is available on your computer, you can also run this in the terminal:

```bash
cursor .
```

If that command does not work, open the folder from the Cursor interface instead.

## Step 6: Run Your First Workflow Stage

Chat commands go into the AI chat box, not the terminal.

In Cursor, type this in the AI chat:

```text
/init Create a simple calculator web application.
```

Some tools support native slash commands.
Other tools use natural-language stage instructions.

For example, a PRD stage can be started with:

```text
/prd
```

or:

```text
prd
Start the PRD stage.
```

If `/prd` is not recognized in Claude Code, enter `prd` or `Start the PRD stage`.

## Step 7: Continue the Workflow

Continue one stage at a time:

```text
/prd
/hld
/sdd
/impl
/review
/deploy
/retro
```

After each stage, read the generated document before moving on.

Confirm the result with the AI before starting the next stage.

You do not need to run all stages at once.

## Check Project Status

Run this in the terminal:

```bash
npx @dayahs/ai-project-workflow status .
```

This shows the current workflow stage and installed platform files.

You can use the shorter `apw status .` command only after a global install.

## Validate the Installation

Run this in the terminal:

```bash
npx @dayahs/ai-project-workflow validate .
```

This checks whether APW files are installed correctly.

You can use the shorter `apw validate .` command only after a global install.

## Common Problems

### `node: command not found`

Node.js is not installed, or your terminal was opened before Node.js was installed.

Install Node.js, then close and reopen your terminal.

### `npm` / `npx` command not found

Reinstall Node.js and reopen your terminal.

Node.js installs npm and npx together.

### `apw: command not found`

You probably did not install APW globally.

Use this instead:

```bash
npx @dayahs/ai-project-workflow status .
```

Or install APW globally:

```bash
npm install -g @dayahs/ai-project-workflow
```

### `Unknown command: /prd`

Your AI coding tool may not support native slash commands.

Use a natural-language stage instruction:

```text
prd
```

or:

```text
Start the PRD stage.
```

### Network failure

Check your internet connection.

Then run the `npx @dayahs/ai-project-workflow ...` command again.

### Files already exist or conflict

APW does not overwrite your files by default.

If a file already exists, APW may create a `.ai-sdd.new` file next to it.

Compare the files before deciding what to keep.

## Next Steps

Start with a small project, such as a calculator, todo app, or personal notes app.

Read each generated document before continuing.

When you are comfortable, read the main [README](../../README.md) and the platform reports in [docs/testing](../testing/compatibility-matrix.md).
