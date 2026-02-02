import chalk from "chalk";
import cfonts from "cfonts"

export async function showLanding() {
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n Goodbye!'));
    process.exit(0);
  });

  console.clear();

  cfonts.say('TARS', {
    font: 'block',
    align: 'center',
    colors: ['cyan', 'magenta'],
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '0',
  });

  console.log(chalk.gray('Press Ctrl+C to eject!\n'));
}
