import { LLM } from './llm';
import { ContextManager } from './contextManager';
import { createGitIgnoreChecker } from './tools/gitIgnoreFileTool';
import { validateAndRunTool } from './tools/validateTool';

export interface QueryResult {
  query: string;
  response: string;
  suggestions?: string[];
  timestamp: Date;
}

export interface LLMConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ProcessorConfig {
  LLMConfig: LLMConfig;
  rootDir: string;
  doesExistInGitIgnore: (path: string) => boolean | null;
}

export type SpinnerUpdateCallback = (text: string) => void;

export class Processor {
  public readonly config: ProcessorConfig;

  private readonly llm: LLM;
  private readonly contextManager: ContextManager;

  constructor(rootDir: string) {
    const gitIgnoreChecker = createGitIgnoreChecker(rootDir);

    this.config = {
      LLMConfig: {
        model: 'gemini-2.5-flash',
      },
      rootDir,
      doesExistInGitIgnore: gitIgnoreChecker,
    };

    this.llm = new LLM(this.config.LLMConfig.model);
    this.contextManager = new ContextManager(rootDir, gitIgnoreChecker);
  }

  private isFinalMessage(response: unknown): response is { text: string } {
    return (
      !!response &&
      !Array.isArray(response) &&
      typeof response === 'object' &&
      'text' in response
    );
  }
};
