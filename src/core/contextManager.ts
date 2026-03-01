import { BASE_PROMPT, EXAMPLES, TOOL_SELECTION_PROMPT, MODE_PROMPTS } from './prompt';
import { toolRegistry } from './tools/toolRegistry';
import { getFolderStructure } from './utils';
import type { AgentMode } from '../types';

export interface Message {
  role: 'user' | 'model';
  content: string;
  tokens?: number;
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

// Rough estimate: 4 characters = 1 token
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export class ContextManager {
  readonly systemPrompt = BASE_PROMPT;

  private readonly gitIgnoreChecker: (path: string) => boolean | null;
  private conversations: Message[] = [];
  private projectState: ProjectState;
  private mode: AgentMode = 'agent'; // default mode
  private summary: string | null = null;
  private maxTokens = 20000;

  constructor(cwd: string, gitIgnoreChecker: (path: string) => boolean | null) {
    this.gitIgnoreChecker = gitIgnoreChecker;
    this.projectState = {
      rootDir: cwd,
      cwd,
      fileTree: this.buildFileTree(cwd),
    };
  }

  // Called when AI uses a tool
  addResponse(response: string, toolCall: ToolCall) {
    const content = `Output of ${JSON.stringify(toolCall)}:\n${response}`;
    this.conversations.push({
      role: 'model',
      content,
      tokens: estimateTokens(content),
    });
  }

  // Called when user types a message
  addUserMessage(query: string) {
    this.conversations.push({
      role: 'user',
      content: query,
      tokens: estimateTokens(query),
    });
  }

  // This builds the full prompt sent to the LLM every turn
  buildPrompt(): string {
    return [
      this.buildSystemSection(),    // base instructions + mode
      this.buildProjectStateSection(), // file tree
      this.buildToolInfoSection(),  // available tools
      this.buildConversationSection(), // chat history
    ].filter(Boolean).join('\n\n');
  }

  setMode(mode: AgentMode) {
    this.mode = mode;
  }

  getMode(): AgentMode {
    return this.mode;
  }

  setSummary(summary: string) {
    this.summary = summary;
  }

  // Used by the status bar in the UI
  getStats() {
    const totalTokens = this.conversations.reduce(
      (acc, msg) => acc + (msg.tokens ?? estimateTokens(msg.content)),
      0
    );
    return {
      messageCount: this.conversations.length,
      totalTokens,
    };
  }

  updateProjectCWD(cwd: string) {
    this.projectState.cwd = cwd;
  }

  async updateProjectStateTree() {
    this.projectState.fileTree = this.buildFileTree(this.projectState.rootDir);
  }

  private buildFileTree(rootDir: string): string {
    return getFolderStructure({ gitIgnoreChecker: this.gitIgnoreChecker, rootDir });
  }

  // System section: base prompt + current mode instructions
  private buildSystemSection(): string {
    return `${this.systemPrompt}\n\n${MODE_PROMPTS[this.mode]}`;
  }

  private buildProjectStateSection(): string {
    return [`CWD: ${this.projectState.cwd}`, `File Tree: ${this.projectState.fileTree}`].join('\n');
  }

  // Sliding window: only keep recent messages that fit in token budget
  private buildConversationSection(): string {
    let section = '--- Conversation ---\n';

    if (this.summary) {
      section += `[EARLIER SUMMARY]: ${this.summary}\n\n`;
    }

    const reversed = [...this.conversations].reverse();
    const included: Message[] = [];
    let tokenCount = 0;

    for (const msg of reversed) {
      const t = msg.tokens ?? estimateTokens(msg.content);
      if (tokenCount + t > this.maxTokens) break;
      included.unshift(msg);
      tokenCount += t;
    }

    for (const msg of included) {
      section += `${msg.role}: ${msg.content}\n`;
    }

    return section;
  }

  private buildToolInfoSection(): string {
    return (
      `Tools available:\n${JSON.stringify(toolRegistry)}\n` +
      `Examples:\n${EXAMPLES}\n` +
      `Response format:\n${TOOL_SELECTION_PROMPT}`
    );
  }
}
