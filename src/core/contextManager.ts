import { BASE_PROMPT, EXAMPLES, TOOL_SELECTION_PROMPT } from './prompt';
import { toolRegistry } from './tools/toolRegistry';
import { getFolderStructure } from './utils';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ProjectState {
  rootDir: string;
  cwd: string;
  fileTree: string;
}

interface ToolCall {
  tool: string;
  toolOptions: any;
}

export class ContextManager {
  readonly systemPrompt = BASE_PROMPT;

  private readonly gitIgnoreChecker: (path: string) => boolean | null;
  private conversations: Message[] = [];
  private projectState: ProjectState;

  constructor(
    cwd: string,
    gitIgnoreChecker: (path: string) => boolean | null
  ) {
    this.gitIgnoreChecker = gitIgnoreChecker;

    this.projectState = {
      rootDir: cwd,
      cwd,
      fileTree: this.buildFileTree(cwd),
    };
  }

  addResponse(response: string, toolCall: ToolCall) {
    this.conversations.push({
      role: 'model',
      content: `Output of ${JSON.stringify(toolCall)}:\n${response}`,
    });
  }

  addUserMessage(query: string) {
    this.conversations.push({
      role: 'user',
      content: query,
    });
  }

  buildPrompt(): string {
    return [
      this.buildSystemSection(),
      this.buildProjectStateSection(),
      this.buildToolInfoSection(),
      this.buildConversationSection(),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  updateProjectCWD(cwd: string) {
    this.projectState.cwd = cwd;
  }

  async updateProjectStateTree() {
    this.projectState.fileTree = this.buildFileTree(
      this.projectState.rootDir
    );
  }

  private buildFileTree(rootDir: string): string {
    return getFolderStructure({
      gitIgnoreChecker: this.gitIgnoreChecker,
      rootDir,
    });
  }

  private buildSystemSection(): string {
    return this.systemPrompt;
  }

  private buildProjectStateSection(): string {
    return [
      `CWD: ${this.projectState.cwd}`,
      `File Tree: ${this.projectState.fileTree}`,
    ].join('\n');
  }

  private buildConversationSection(): string {
    const recent = this.conversations.slice(-10);

    let section = '--- Recent Conversation ---\n';
    for (const msg of recent) {
      section += `${msg.role}: ${msg.content}\n`;
    }

    return section;
  }

  private buildToolInfoSection(): string {
    return (
      `These are your tools and what they expect:\n` +
      `${JSON.stringify(toolRegistry)}\n` +
      `Here are some examples:\n${EXAMPLES}\n` +
      `The expected response format is:\n${TOOL_SELECTION_PROMPT}`
    );
  }
}
