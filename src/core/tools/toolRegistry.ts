export const toolRegistry = [
{
  name: 'read_file',
  
  description: `Reads and returns the content of a file from the local filesystem.

PURPOSE:
Examine file contents before making changes or to understand codebase structure. This is typically the first tool used before any file modification.

SUPPORTED FILE TYPES:
- Text files: .ts, .js, .json, .md, .txt, .css, .html, etc.
- Images: .png, .jpg, .gif, .webp, .svg, .bmp
- Documents: .pdf

KEY FEATURES:
- Read entire file or specific line ranges
- Supports large files through pagination
- Returns raw content for text files
- Validates file exists and is readable before operation

WHEN TO USE:
- Before editing a file (see current content and structure)
- To understand how code is organized
- To find exact text for edit_file tool
- To verify changes after editing
- To analyze file structure or patterns

WORKFLOW:
1. Use read_file to see current content
2. Identify what needs to change
3. Use edit_file with exact text from read_file output
4. Optionally read_file again to verify changes

LINE RANGE USAGE:
For large files (1000+ lines), read in chunks to avoid overwhelming context.

Example workflow for large file:
  1. Read lines 1-100 to see beginning
  2. Read lines 500-600 to see middle section
  3. Search with grep to find specific content
  4. Read only the relevant section

VALIDATION:
Tool checks before reading:
- Path is absolute (not relative)
- File exists at specified path
- Path points to file (not directory)
- File has read permissions

COMMON PATTERNS:

Pattern 1: Examine before editing
  Step 1: read_file with absolutePath
  Step 2: Find section to change
  Step 3: Use edit_file with exact text

Pattern 2: Navigate large file
  Step 1: read_file lines 1-50 (check imports/top)
  Step 2: grep to find function location
  Step 3: read_file specific line range around function

Pattern 3: Verify after changes
  Step 1: edit_file to make changes
  Step 2: read_file to confirm changes applied correctly

TROUBLESHOOTING:

"File does not exist"
  Check path is correct and absolute.
  Use glob or grep to find file first.

"Path is not a file"
  You tried to read a directory.
  Use glob to list directory contents instead.

"File is not readable"
  Permission issue or file is locked.
  Check file permissions or if another process is using it.

"startLine without endLine"
  Both must be provided together.
  Either read whole file or specify both line numbers.

"endLine less than startLine"
  Line numbers are reversed.
  Ensure startLine < endLine.`,

  toolOptions: {
    absolutePath: {
      description: `Absolute path to the file to read.

Must be a complete path starting from root directory.

Valid formats:
  Unix/Linux: /home/user/project/src/file.ts
  Windows: C:/Users/user/project/src/file.ts

Invalid formats:
  src/file.ts (relative path)
  ./file.ts (relative path)
  ../other/file.ts (relative path)

Construction:
  Combine root directory with relative path:
  absolutePath = process.cwd() + /src/components/Button.tsx

Common mistakes:
  - Using relative paths (will fail validation)
  - Missing file extension
  - Typos in path or filename
  - Using backslashes on Unix (use forward slashes)

Tip: Use glob tool first to find exact file path if unsure`,
      type: String,
      required: true
    },

    startLine: {
      description: `Starting line number for partial file reading.

Line numbering:
  First line of file is line 1 (not 0)
  Must be positive integer
  Must be less than or equal to endLine

Use cases:
  - Reading first 100 lines: startLine: 1, endLine: 100
  - Reading middle section: startLine: 500, endLine: 600
  - Skipping header: startLine: 10, endLine: 50

Requirements:
  - Must provide endLine when using startLine
  - Cannot use startLine alone
  - startLine must be >= 1
  - startLine must exist in file (cannot exceed total lines)

Example:
  File has 1000 lines
  startLine: 1, endLine: 100 (read first 100 lines)
  startLine: 900, endLine: 1000 (read last 100 lines)

Performance tip:
  For large files (5000+ lines), use line ranges to avoid
  loading entire file into context.`,
      type: Number,
      optional: true
    },

    endLine: {
      description: `Ending line number for partial file reading.

Line numbering:
  Inclusive (line at endLine is included in output)
  Must be positive integer
  Must be greater than or equal to startLine

Requirements:
  - Must provide startLine when using endLine
  - Cannot use endLine alone
  - endLine must be >= startLine
  - endLine cannot exceed total lines in file

Validation:
  If file has 500 lines:
    Valid: endLine: 500 (read to end)
    Valid: endLine: 250 (read to middle)
    Invalid: endLine: 501 (exceeds file length)

Special case:
  To read from line N to end of file, you need to know
  the total line count first. Consider reading whole file
  or using grep to find content instead.

Example workflows:
  1. Read header: startLine: 1, endLine: 20
  2. Read footer: startLine: 480, endLine: 500
  3. Read function: startLine: 145, endLine: 178`,
      type: Number,
      optional: true
    }
  },

  required: ['absolutePath'],
  
  returns: {
    DisplayResult: 'Human-readable description. Example: Reading src/App.tsx or Reading lines 1-100 from config.ts',
    LLMresult: 'Raw file content as string. Full file or specified line range.'
  },

  examples: [
    {
      name: 'Read entire file',
      input: {
        absolutePath: '/home/user/project/src/index.ts'
      },
      output: 'Full content of index.ts file'
    },
    {
      name: 'Read first 50 lines (check imports and setup)',
      input: {
        absolutePath: '/home/user/project/src/App.tsx',
        startLine: 1,
        endLine: 50
      },
      output: 'Lines 1-50 of App.tsx'
    },
    {
      name: 'Read specific function (after finding with grep)',
      input: {
        absolutePath: '/home/user/project/src/utils/helpers.ts',
        startLine: 145,
        endLine: 178
      },
      output: 'Lines 145-178 containing specific function'
    },
    {
      name: 'Read large config file in sections',
      input: {
        absolutePath: '/home/user/project/config/webpack.config.js',
        startLine: 1,
        endLine: 200
      },
      note: 'For 1000+ line files, read in chunks of 100-200 lines'
    }
  ],

  type: Object
},

{
  name: 'edit_file',
  
  description: `Replaces text within a file using exact string matching.

PURPOSE:
Modify existing files by finding and replacing exact text. Works like Find & Replace in a code editor, but automated by the AI agent.

CRITICAL RULES (Tool fails if not followed):

1. Always read the file first using read_file tool
   - You must see current content before editing
   - Ensures you know exact formatting and context

2. Use absolute paths only
   - Correct: /home/user/project/src/index.ts
   - Wrong: src/index.ts or ./index.ts

3. Match text exactly (whitespace, indentation, newlines matter)
   - Copy exact text from read_file output
   - Include surrounding context (3+ lines before and after)
   - One wrong space causes failure

4. Never escape strings
   - Correct: function hello() {\n  return "hi";\n}
   - Wrong: function hello() {\\n  return \\"hi\\";\\n}

HOW IT WORKS:

Single Replacement (default):
  Replaces one occurrence. Fails if multiple matches exist to avoid ambiguity.
  
  Example file content:
    import { useState } from 'react';
    
    function App() {
      const [count, setCount] = useState(0);
      return <div>{count}</div>;
    }
  
  To add error handling:
    oldString: "function App() {\n  const [count, setCount] = useState(0);\n  return <div>{count}</div>;\n}"
    newString: "function App() {\n  const [count, setCount] = useState(0);\n  if (count < 0) throw new Error('Invalid');\n  return <div>{count}</div>;\n}"

Multiple Replacements:
  Set expected_replacements to replace all exact matches.
  
  Example - removing all debug logs:
    oldString: "console.log"
    newString: "// console.log"
    expected_replacements: 3

SAFETY FEATURES:

- Atomic operation: all replacements succeed or none happen
- Validates file exists, is writable, path is absolute
- Requires context to prevent wrong matches
- Returns full content for verification

BEST PRACTICES:

Do:
  - Read file first, copy exact text
  - Include 3-5 lines of context
  - Preserve exact indentation
  - Use git to track changes
  - Test with small changes first

Don't:
  - Guess formatting
  - Use relative paths
  - Escape newlines or quotes
  - Edit without reading first
  - Use for large refactoring (break into smaller edits)

TROUBLESHOOTING:

"No occurrences found"
  Your oldString doesn't match exactly.
  Read file again, check whitespace and indentation.

"Multiple matches found"
  Your oldString is too generic.
  Include more context to make it unique.

"File path must be absolute"
  Construct full path: rootDir + relativePath

WHY CONTEXT MATTERS:

Bad (ambiguous):
  oldString: "return result;"
  Could match many functions

Good (unique):
  oldString: "function calculateTotal() {\n  const sum = items.reduce((a, b) => a + b, 0);\n  return result;\n}"
  Matches only this specific function`,

  toolOptions: {
    filePath: {
      description: `Absolute path to file being modified.
      
Must start with / (Unix) or drive letter (Windows).
Construct from: process.cwd() + /relative/path/to/file.ts

Examples:
  Valid: /home/user/project/src/App.tsx
  Valid: /Users/dev/code/api/routes.ts
  Invalid: src/App.tsx (relative path)
  Invalid: ./routes.ts (relative path)`,
      type: String,
      required: true
    },

    oldString: {
      description: `Exact text to find and replace.

Requirements:
  - Must match file content exactly
  - Include 3+ lines of surrounding code for context
  - Preserve all whitespace, tabs, newlines, indentation
  - Do not escape quotes, newlines, or special characters
  - Must be unique in file unless using expected_replacements

Good example:
  import React from 'react';
  import { useState } from 'react';
  
  function App() {

Bad example:
  function App() {
  (Too generic, might match multiple places)

Tip: Copy-paste directly from read_file output`,
      type: String,
      required: true
    },

    newString: {
      description: `Exact replacement text.

Requirements:
  - Provide complete, valid code
  - Match indentation style of file (tabs vs spaces)
  - Ensure syntax is correct
  - Do not escape special characters
  - Can be empty string to delete oldString

Example - Adding a line:
  OLD: function hello() {\n  console.log('hi');\n}
  NEW: function hello() {\n  console.log('Starting...');\n  console.log('hi');\n}

Example - Removing code:
  OLD: const unused = 123;\n
  NEW: (empty string)`,
      type: String,
      required: true
    },

    expected_replacements: {
      description: `Number of times oldString should be replaced.

Default: 1 (single replacement, fails if multiple matches)

Use cases:
  1 - Replace one specific occurrence (default, safest)
  2+ - Replace multiple identical occurrences

Example: Replace all deprecated API calls
  expected_replacements: 5
  Tool verifies exactly 5 matches exist before replacing

Safety: If actual matches != expected_replacements, tool fails.
This prevents accidental over or under replacement.

When to use:
  1 for targeted single edits (default)
  2+ for bulk changes like renaming variables`,
      type: Number,
      optional: true,
      default: 1,
      minimum: 1
    }
  },

  required: ['filePath', 'oldString', 'newString'],
  
  returns: {
    DisplayResult: 'Human-readable summary shown to user. Example: Replaced 1 occurrence in App.tsx',
    LLMresult: 'Full file content after replacement for AI verification'
  },

  examples: [
    {
      name: 'Add TypeScript type to function',
      input: {
        filePath: '/project/src/greet.ts',
        oldString: 'function greet(name) {\n  return `Hello, ${name}`;\n}',
        newString: 'function greet(name: string): string {\n  return `Hello, ${name}`;\n}'
      }
    },
    {
      name: 'Add error handling to async function',
      input: {
        filePath: '/project/src/api.ts',
        oldString: 'async function fetchUser(id) {\n  const response = await fetch(`/api/users/${id}`);\n  return response.json();\n}',
        newString: 'async function fetchUser(id) {\n  try {\n    const response = await fetch(`/api/users/${id}`);\n    if (!response.ok) throw new Error(`HTTP ${response.status}`);\n    return response.json();\n  } catch (error) {\n    console.error("Failed to fetch user:", error);\n    throw error;\n  }\n}'
      }
    },
    {
      name: 'Replace all deprecated API calls',
      input: {
        filePath: '/project/src/legacy.ts',
        oldString: 'api.getData()',
        newString: 'api.fetchData()',
        expected_replacements: 3
      }
    }
  ],

  type: Object
},

{
  name: 'new_file',
  
  description: `Creates a new file with specified content at the given path.

PURPOSE:
Generate new files in the project such as components, utilities, configs, or documentation. Use when you need to add new functionality rather than modify existing files.

WHEN TO USE:
- Creating new modules or components
- Adding new utility functions in separate files
- Generating configuration files
- Creating test files
- Adding documentation or README files
- Scaffolding new features

WHEN NOT TO USE:
- Modifying existing files (use edit_file instead)
- Adding to existing files (use read_file then edit_file)
- Creating files that already exist (will overwrite without warning)

BEHAVIOR:
- Creates parent directories if they don't exist
- Overwrites existing files without confirmation
- Writes content exactly as provided
- No automatic formatting applied

SAFETY CONSIDERATIONS:
File overwriting:
  If file already exists, it will be replaced completely.
  Use read_file first to check if file exists.
  No backup is created automatically.
  
Safe workflow:
  1. Use glob to check if file exists
  2. If exists, decide: overwrite or use different name
  3. Create file with new_file
  4. Verify with read_file

Best practices:
  - Check file doesn't exist first
  - Use git to track changes
  - Include complete, valid content
  - Match project's file structure conventions

CONTENT FORMATTING:
You must provide properly formatted content:
  - Include all necessary imports
  - Use correct indentation (tabs vs spaces)
  - Follow project's code style
  - Ensure valid syntax
  - Add file header comments if project uses them

The tool does NOT:
  - Auto-format code
  - Add missing imports
  - Fix syntax errors
  - Apply prettier/eslint

COMMON PATTERNS:

Pattern 1: Create component
  1. Check naming convention (PascalCase, kebab-case, etc)
  2. Create file with imports, component, export
  3. Verify with read_file

Pattern 2: Create utility module
  1. Plan exported functions
  2. Create file with all functions and types
  3. Update index.ts to export new module

Pattern 3: Create test file
  1. Read source file to understand what to test
  2. Create corresponding .test.ts file
  3. Write test cases based on source

Pattern 4: Create config file
  1. Read similar config files for format reference
  2. Create new config with correct structure
  3. Update any imports or references to new config

DIRECTORY HANDLING:
Parent directories:
  If /src/components/Button/ doesn't exist,
  it will be created automatically when you create
  /src/components/Button/index.tsx

File structure:
  Tool creates the file but doesn't update:
  - Import statements in other files
  - Index files that re-export
  - Package.json or tsconfig paths
  
  You may need additional tool calls to wire up new files.

TROUBLESHOOTING:

"Failed to create file"
  Check parent directory path is valid.
  Ensure you have write permissions.
  Verify path uses forward slashes.

"File path must be absolute"
  Construct full path from root.
  Don't use relative paths like ./file.ts

File not appearing in project:
  Check you created it in correct directory.
  Use glob to verify file was created.
  Ensure path matches project structure.

Syntax errors after creation:
  Content wasn't properly formatted.
  Read file back to verify content.
  Use edit_file to fix issues.`,

  toolOptions: {
    filePath: {
      description: `Absolute path where new file will be created, including filename and extension.

Path requirements:
  - Must be absolute (start from root)
  - Must include filename and extension
  - Use forward slashes (/) not backslashes
  - Parent directories will be created if needed

Construction:
  rootDir + /relative/path/to/filename.ext
  
Examples:
  Valid: /home/user/project/src/components/Button.tsx
  Valid: /home/user/project/tests/unit/auth.test.ts
  Valid: /home/user/project/docs/API.md
  Invalid: src/Button.tsx (relative path)
  Invalid: ./components/Button.tsx (relative path)
  Invalid: /src/Button (missing extension)

Common patterns:
  Components: /src/components/ComponentName/index.tsx
  Utils: /src/utils/utilityName.ts
  Tests: /src/__tests__/featureName.test.ts
  Configs: /config/environment.config.ts
  Docs: /docs/setup-guide.md

Naming conventions:
  Check project style:
  - PascalCase for components: UserProfile.tsx
  - camelCase for utilities: formatDate.ts
  - kebab-case for some projects: user-profile.tsx
  
  Match existing patterns in the project.

Tips:
  - Use glob to see existing naming patterns
  - Check similar files for location conventions
  - Include proper file extension
  - Ensure path doesn't conflict with existing files`,
      type: String,
      required: true
    },

    content: {
      description: `Complete file content as a string.

Content requirements:
  - Must be valid, complete code
  - Include all necessary imports
  - Use proper indentation
  - Match project's code style
  - Add exports if needed

Formatting considerations:
  - Preserve newlines with \n
  - Use same indentation as project (2 spaces, 4 spaces, or tabs)
  - Don't escape quotes unless inside strings
  - Include file header comments if project uses them

What to include:
  For TypeScript/JavaScript files:
    - Import statements
    - Type definitions
    - Function/class implementations
    - Export statements
  
  For config files:
    - Proper JSON/YAML/TOML syntax
    - All required fields
    - Valid values
  
  For documentation:
    - Proper markdown formatting
    - Clear headings
    - Complete information

Empty content:
  Can be empty string to create placeholder file
  Example: Creating .gitkeep or empty config

Special characters:
  - Newlines: use \n
  - Tabs: use \t or spaces
  - Quotes: use as needed, no escaping required
  
Example structures:

TypeScript component:
  import React from 'react';
  
  interface Props {
    name: string;
  }
  
  export function Component({ name }: Props) {
    return <div>{name}</div>;
  }

Utility function:
  export function formatDate(date: Date): string {
    return date.toISOString();
  }

Config file:
  {
    "name": "value",
    "setting": true
  }

Test file:
  import { describe, it, expect } from 'vitest';
  import { myFunction } from '../myFunction';
  
  describe('myFunction', () => {
    it('should work', () => {
      expect(myFunction()).toBe(true);
    });
  });`,
      type: String,
      required: true
    }
  },

  required: ['filePath', 'content'],
  
  returns: {
    DisplayResult: 'Human-readable confirmation. Example: File /src/Button.tsx created successfully',
    LLMresult: 'Success message or error details'
  },

  examples: [
    {
      name: 'Create React component',
      input: {
        filePath: '/home/user/project/src/components/Button.tsx',
        content: `import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
}`
      }
    },
    {
      name: 'Create utility function',
      input: {
        filePath: '/home/user/project/src/utils/formatters.ts',
        content: `export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US');
}`
      }
    },
    {
      name: 'Create configuration file',
      input: {
        filePath: '/home/user/project/config/database.json',
        content: `{
  "host": "localhost",
  "port": 5432,
  "database": "myapp",
  "ssl": false
}`
      }
    },
    {
      name: 'Create test file',
      input: {
        filePath: '/home/user/project/src/__tests__/auth.test.ts',
        content: `import { describe, it, expect } from 'vitest';
import { authenticateUser } from '../auth';

describe('authenticateUser', () => {
  it('should return true for valid credentials', () => {
    const result = authenticateUser('user', 'pass');
    expect(result).toBe(true);
  });
  
  it('should return false for invalid credentials', () => {
    const result = authenticateUser('user', 'wrong');
    expect(result).toBe(false);
  });
});`
      }
    },
    {
      name: 'Create empty placeholder',
      input: {
        filePath: '/home/user/project/data/.gitkeep',
        content: ''
      },
      note: 'Creates empty file to preserve directory in git'
    }
  ],

  type: Object
},
]
