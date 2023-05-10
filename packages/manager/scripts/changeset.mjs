import { execSync } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';

const writeFileAsync = promisify(fs.writeFile);
const changesetTypes = ['Added', 'Fixed', 'Changed', 'Removed', 'Tech Stories'];
const separator = chalk.white(
  '\n==============================================\n'
);

async function run() {
  /**
   * Check if the "gh" command-line tool is installed.
   */
  try {
    execSync('gh version');
  } catch (error) {
    console.log(separator);
    console.log(
      chalk.red('Error: The "gh" command-line tool is not installed.')
    );
    console.log(
      'Please install it from https://github.com/cli/cli#installation'
    );
    console.log(separator);
    process.exit(1);
  }

  /**
   * Get the pull request number for the current branch.
   * This will fail if the current branch is not a pull request.
   */
  const prNumber = await getPRNumber();

  /**
   * Prompt the user for the type of change and a description.
   */
  const { type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'What type of change is this?',
      choices: changesetTypes,
    },
  ]);
  const { description } = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Describe the change:',
      validate: (value) =>
        value.trim()
          ? true
          : "Please enter a sentence to describe the change. (don't include the PR number)",
    },
  ]);

  /**
   * Create the changeset file.
   */
  const prLink = `https://github.com/linode/manager/pull/${prNumber}`;
  const changesetFile = `./changesets/${Date.now()}-${type
    .toLowerCase()
    .replace(/\s/g, '-')}.md`;
  const changesetContent = `---\n"@linode/manager": [${type}]\n---\n\n${description} (${prLink})\n`;

  await writeFileAsync(changesetFile, changesetContent, { encoding: 'utf-8' });

  console.log(`Changeset created: ${changesetFile}`);
}

/**
 * Utility to get the pull request number for the current branch.
 *
 * @requires gh
 */
async function getPRNumber() {
  try {
    const output = execSync(`gh pr view --json number --jq=".number"`, {
      encoding: 'utf-8',
    });

    return parseInt(output.trim(), 0);
  } catch (error) {
    console.log(separator);
    console.error(
      chalk.red(
        "Failed to get pull request number.\nPlease open a pull request for the current branch and let's try this again!"
      )
    );
    console.log(separator);
    process.exit(1);
  }
}

run();
