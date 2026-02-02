import { text, confirm } from '@clack/prompts';
import chalk from 'chalk';
import { Processor } from '../processor';
import { showLanding } from './landing';

export async function runCli() {
  const rootDir = process.cwd();
  
  await showLanding();
  
  const processor = new Processor(rootDir);
  
  while (true) {
    try {
      const query = await text({
        message: 'What do you need?',
        placeholder: 'e.g., "Add error handling to readFile" or "Find all TODO comments"',
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Please enter a query';
          }
        },
      });

      if (typeof query === 'symbol') {
        const shouldExit = await confirm({
          message: 'Exit?',
          initialValue: false,
        });

        if (shouldExit === true) {
          console.log(chalk.yellow('\nExiting...\n'));
          process.exit(0);
        }
        continue;
      }

      if (typeof query === 'string' && query.trim()) {
        await processor.processQuery(query.trim());
      }

      console.log();
    } catch (error) {
      if (error instanceof Error && error.message.includes('canceled')) {
        console.log(chalk.yellow('\nCanceled\n'));
        process.exit(0);
      }
      
      console.log(chalk.red('\nError:'), error);
      
      const shouldContinue = await confirm({
        message: 'Continue?',
        initialValue: true,
      });

      if (!shouldContinue) {
        console.log(chalk.yellow('\nEjecting...\n'));
        process.exit(0);
      }
      
      console.log();
    }
  }
}
