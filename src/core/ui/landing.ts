import cfonts from 'cfonts';
import chalk from 'chalk';

export async function showLanding(version: string, model: string) {
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
    space: false,
    maxLength: '0',
  });

  // version + model + cwd on one line
  const cwd = process.cwd().replace(process.env.HOME || '', '~');
  console.log(chalk.gray(`  v${version} · ${model} · ${cwd}\n`));

  // capability pills
  const pills = ['read files', 'edit files', 'run commands', 'search code', 'create files'];
  const pillStr = pills.map(p => chalk.bgHex('#0d2e1a').hex('#27c93f')(` ${p} `)).join('  ');
  console.log('  ' + pillStr + '\n');

  console.log(chalk.gray('  ─────────────────────────────────────\n'));
}
