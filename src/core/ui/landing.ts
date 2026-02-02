import cfonts from 'cfonts';
import chalk from 'chalk';

const CAPABILITIES = [
  'Read and analyze files in your project',
  'Edit existing files with surgical precision',
  'Create new files and components',
  'Search code using grep and glob patterns',
  'Execute shell commands',
  'Understand your codebase structure',
];

export async function showLanding() {
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\nGoodbye!\n'));
    process.exit(0);
  });

  console.clear();

  cfonts.say('TARS', {
    font: 'block',
    align: 'left',
    colors: ['cyan'],
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '0',
  });

  console.log(chalk.gray.dim('Tactical Automated Response System\n'));
  
  console.log(chalk.white.bold('Capabilities:\n'));
  CAPABILITIES.forEach(capability => {
    console.log(chalk.gray('  •'), chalk.white(capability));
  });
  
  console.log();
  console.log(chalk.gray.dim('Press Ctrl+C to exit\n'));
}
