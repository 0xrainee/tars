import { text } from '@clack/prompts';
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
        message: 'Enter your query:',
        placeholder: 'e.g., "Create a users table with email and password fields"',
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Please enter a query';
          }
        },
      });

      if (typeof query === 'symbol') {
        console.log(chalk.yellow('\nEjecting...'));
        process.exit(0);
      }

      if (typeof query === 'string' && query.trim()) {
        await processor.processQuery(query.trim());
      }

      console.log();
    } catch (error) {
      console.log(chalk.red('Error:'), error);
      process.exit(0);
    }
  }
}
