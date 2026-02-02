import { StreamingSpinner } from './ui/spinner';
import { LLM } from './llm';
import { ContextManager } from './contextManager';
import { validateAndRunTool } from './tools/validateTool';
import { createGitIgnoreChecker } from './tools/gitIgnoreFileTool';

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
  gitIgnoreChecker: (path: string) => boolean;
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
      gitIgnoreChecker: gitIgnoreChecker,
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

  async processQuery(query: string) {
    this.contextManager.addUserMessage(query);

    const spinner = new StreamingSpinner();
    spinner.start('The Endurance is spinning...');

    while (true) {
      const prompt = this.contextManager.buildPrompt();
      const rawResponse = await this.llm.streamResponse(prompt, () => {});

      let parsedResponse: any;

      try {
        parsedResponse = this.parseLLMResponse(rawResponse);

        if (this.isFinalMessage(parsedResponse)) {
          spinner.succeed(parsedResponse.text);
          break;
        }
      } catch (err) {
        console.error(err);
        spinner.succeed('Response completed!');
        break;
      }

      for (const toolCall of parsedResponse) {
        if (!toolCall || typeof toolCall !== 'object' || !('tool' in toolCall)) {
          continue;
        }

        spinner.updateText(
          toolCall.description || 'Spinning...'
        );

        try {
          const result = await validateAndRunTool(
            toolCall,
            this.config,
            this.config.rootDir
          );

          this.contextManager.addResponse(
            result.result?.LLMresult as string,
            toolCall
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : String(err);

          spinner.updateText('[AGENT ERROR] ' + message);
          console.error('[AGENT ERROR]', err);
        }
      }
    }
  }

  private parseLLMResponse(response: string): any {
    let clean = response.trim();

    if (clean.startsWith('```')) {
      clean = clean
        .replace(/^```[a-zA-Z]*\n?/, '')
        .replace(/```$/, '')
        .trim();
    }

    const parsed = JSON.parse(clean);
    return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
  }
}
