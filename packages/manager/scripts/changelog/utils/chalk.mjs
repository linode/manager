import chalk from 'chalk';

export const logSeparator = (color = 'white') =>
  console.log(
    chalk[color]('\n======================================================\n')
  );

export const consoleLog = (message, color = 'white') => {
  console.warn(chalk[color](message));
};

export const consoleError = (message) => {
  console.error(chalk.red(message));
};
