import chalk from 'chalk';
import process from 'process';

export const logSeparator = (color = 'white') =>
  console.log(
    chalk[color]('\n======================================================\n')
  );

const success = (message, info) => {
  logSeparator('green');
  console.warn(chalk.greenBright(message));
  info && console.warn(`\n➔ ${info}`);
  logSeparator('green');
};

const neutral = (message, info) => {
  logSeparator();
  console.warn(chalk.white(message));
  info && console.warn(`\n➔ ${info}`);
  logSeparator();
};

const error = (message, info) => {
  logSeparator('red');
  console.error(chalk.redBright(message));
  info && console.warn(`\n➔ ${info}`);
  logSeparator('red');
  process.exit(1);
};

export const logger = {
  success: ({ message, info }) => success(message, info),
  neutral: ({ message, info }) => neutral(message, info),
  error: ({ message, info }) => error(message, info),
};
