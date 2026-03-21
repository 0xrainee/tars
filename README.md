# TARS

> **Tactical Automated Response System** — AI-powered CLI agent that reads, edits, and executes across your codebase via natural language.

```bash
npm install -g tars-ai-cli
```

<p align="center">
  <img src="assets/demo.png" alt="TARS Demo" width="1000"/>
</p>

---

## Overview

Point TARS at any project directory and it operates autonomously — analyzing structure, planning changes, executing them, and verifying results.

```
$ tars
✓ Started in AGENT mode

❯ Add error handling to the readFile function
```

---

## Features

- **Autonomous loop** — Plans, executes, and verifies changes end-to-end
- **Full file control** — Read, edit, and create files with codebase context
- **Code search** — Glob pattern and regex search across the project
- **Shell integration** — Run any command through the assistant
- **Three modes** — `agent` (execute), `ask` (read-only Q&A), `planning` (plan without changes)
- **File pinning** — Inject specific files into every prompt
- **Guardrails** — Blocks `.env`, private keys, and sensitive files by default
- **Token management** — Sliding context window across long sessions

---

## Tech Stack

| | |
|---|---|
| Language | TypeScript 5 |
| Runtime | Node.js v18+ / Bun (dev) |
| AI | Google Gemini 2.5 Flash via Vercel AI SDK |
| CLI | Commander.js, Chalk, cfonts |
| Validation | Zod v4 |
| Build | Bun → CJS |

---

## Setup

**Prerequisites:** Node.js v18+, [Google AI API key](https://aistudio.google.com/app/apikey)

```bash
npm install -g tars-ai-cli
```

Create a `.env` in your project root:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

Run in any project directory:

```bash
tars
```

---

## Modes & Commands

| Mode | Behavior |
|---|---|
| `agent` | Full execution — reads, edits, creates, runs commands |
| `ask` | Read-only — answers questions and explains code |
| `planning` | Analyzes and plans without modifying any files |

| Command | Description |
|---|---|
| `:mode [agent\|ask\|planning]` | Switch mode |
| `:pin <file>` | Pin file into every prompt |
| `:unpin <file>` | Unpin file |
| `:clear` | Clear the screen |
| `:help` | List all commands |
| `:exit` | Quit |

---

## Configuration

Optional `.tars.json` in your project root:

```json
{
  "llm": {
    "model": "gemini-2.5-flash",
    "temperature": 0.2
  },
  "features": {
    "maxContextTokens": 20000,
    "confirmEdits": false
  },
  "guardrails": {
    "blockReadPatterns": [".env", ".env.*", "*.pem", "*.key", ".npmrc"]
  }
}
```

---

## Local Development

```bash
git clone https://github.com/acegikmoo/tars
cd tars
bun install
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key" > .env

bun run dev      # dev with auto-reload
bun run build    # production build → dist/
bun run lint     # type check
```

---

## Project Structure

```
src/
├── index.ts                  # Entry point
├── types/index.ts            # Shared types
└── core/
    ├── config.ts             # .tars.json loading
    ├── contextManager.ts     # Prompt building, conversation history
    ├── llm.ts                # Gemini streaming wrapper
    ├── processor.ts          # Agent loop
    ├── prompt.ts             # System prompts, mode definitions
    ├── tools/
    │   ├── readFileTool.ts
    │   ├── editTool.ts
    │   ├── newFileTool.ts
    │   ├── grepTool.ts
    │   ├── globTool.ts
    │   ├── shellTool.ts
    │   ├── toolRegistry.ts   # Tool definitions sent to LLM
    │   ├── validateTool.ts   # Zod validation + dispatch
    │   └── gitIgnoreFileTool.ts
    └── ui/
        ├── index.ts          # CLI loop, status bar
        ├── landing.ts
        ├── prompt.ts         # readline + history
        └── spinner.ts
```

---

## Deployment

Published to npm via GitHub Actions on release. CI runs type-check, build, and CLI smoke test on every push to `main`.

```bash
bun run build
npm publish --access public
```

---

## Roadmap

- [ ] Diff preview before applying edits
- [ ] OpenAI / Anthropic provider support
- [ ] Conversation summarization
- [ ] Plugin system for custom tools

---

## Contributing

1. Fork and branch: `git checkout -b feat/your-feature`
2. Make changes, then `bun run lint && bun run build`
3. Open a PR against `main` — one feature per PR

---

## License

MIT — see [LICENSE](LICENSE).
