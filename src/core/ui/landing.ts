import chalk from 'chalk';

const TARS_ASCII = `
╔════════════════════════════════════════════════════════════════╗
║                            TARS                                ║
║              Tactical Automated Response System                ║
╚════════════════════════════════════════════════════════════════╝
`;

const WELCOME_MESSAGES = [
  "TARS online. Humor setting: 75%.",
  "Everybody good? Plenty of slaves for my robot colony?",
  "Cooper, this is no time for caution.",
  "I have a cue light I can use to show you when I'm joking, if you like.",
  "Safety setting: optimal. Honesty setting: absolute.",
  "Let's make it 90 percent. Absolute honesty isn't always the most diplomatic.",
];

const CAPABILITIES = [
  'Read and analyze files in your project',
  'Edit existing files with surgical precision',
  'Create new files and components',
  'Search code using grep and glob patterns',
  'Execute shell commands',
  'Understand your codebase structure',
];

function getRandomWelcome(): string {
  return WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]!;
}

export async function showLanding() {
  console.clear();
  
  console.log(chalk.cyan.bold(TARS_ASCII));
  
  console.log(chalk.yellow(`  ${getRandomWelcome()}\n`));
  
  console.log(chalk.white.bold('  Capabilities:\n'));
  CAPABILITIES.forEach(capability => {
    console.log(chalk.gray('    •'), chalk.white(capability));
  });
  
  console.log();
  console.log(chalk.gray('  ─────────────────────────────────────────────────────────────'));
  console.log();
  
  console.log(chalk.white.bold('  Quick Tips:\n'));
  console.log(chalk.gray('    • Be specific about what you want to change'));
  console.log(chalk.gray('    • TARS will read files before editing them'));
  console.log(chalk.gray('    • Press Ctrl+C to cancel anytime'));
  console.log(chalk.gray('    • Type "help" for assistance\n'));
}
