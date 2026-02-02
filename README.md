# TARS

**Tactical Automated Response System** - An AI-powered CLI coding assistant that helps you work with codebases through natural language.

## Features

- **File Operations** - Read, edit, and create files with context awareness
- **Code Search** - Find files and search content using glob patterns and regex
- **Shell Integration** - Execute commands directly from the assistant
- **Project Understanding** - Analyzes your codebase structure and coding patterns
- **Style Consistency** - Matches existing code conventions automatically

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd tars

# Install dependencies
bun install
```

## Setup

1. Get a Google AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

2. Create a `.env` file:

```bash
cp .env.example .env
```

3. Add your API key to `.env`:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

## Usage

```bash
# Run in development mode
bun run dev

# Build for production
bun run build

# Run built version
bun start
```

### Example Commands

```
What do you need? Add error handling to readFile function
What do you need? Find all TODO comments in the project
What do you need? Create a logger utility
What do you need? Fix the build
```

## How It Works

TARS operates autonomously through a loop:

1. **Understands** your request using natural language
2. **Analyzes** your codebase structure and patterns
3. **Plans** the necessary steps
4. **Executes** file operations and commands
5. **Verifies** changes work correctly

### Available Tools

- `read_file` - Read file contents with optional line ranges
- `edit_file` - Modify files using exact string replacement
- `new_file` - Create new files with proper formatting
- `grep` - Search file contents using regex patterns
- `glob` - Find files matching patterns (e.g., `**/*.ts`)
- `shell_command` - Execute shell commands

## Configuration

TARS uses Google's Gemini 2.5 Flash model by default. The configuration can be modified in `src/core/processor.ts`:

```typescript
this.config = {
  LLMConfig: {
    model: "gemini-2.5-flash",
  },
  // ...
};
```

## Project Structure

```
tars/
├── src/
│   ├── core/
│   │   ├── tools/          # Tool implementations
│   │   ├── ui/             # CLI interface
│   │   ├── contextManager.ts
│   │   ├── llm.ts
│   │   ├── processor.ts
│   │   └── prompt.ts
│   ├── types/
│   └── index.ts
└── package.json
```

## Requirements

- [Bun](https://bun.sh) v1.2.19 or higher
- Node.js (for compatibility)
- Google AI API key

## Development

```bash
# Run with auto-reload
bun run dev

# Type checking
bun run tsc --noEmit
```

## License

MIT License - see [LICENSE](LICENSE) for details

## Credits

Created with Bun and powered by Google's Gemini AI.
