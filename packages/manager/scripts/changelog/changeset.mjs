import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import process from 'process';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { getPullRequestId } from './utils/getPullRequestId.mjs';
import { promisify } from 'util';
import { consoleError, consoleLog, logSeparator } from './utils/chalk.mjs';

const writeFileAsync = promisify(fs.writeFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const changesetsDirectory = path.join(__dirname, '../../.changeset');
const changesetTypes = ['Added', 'Fixed', 'Changed', 'Removed', 'Tech Stories'];

async function generateChangeset() {
  /**
   * Check if the "gh" command-line tool is installed.
   */
  try {
    execSync('gh version');
  } catch (error) {
    logSeparator();
    consoleError('Error: The "gh" command-line tool is not installed.');
    consoleLog(
      'Please install it from https://github.com/cli/cli#installation\nand sign in with your GitHub account.'
    );
    logSeparator();
    process.exit(1);
  }

  /**
   * Get the pull request number for the current branch.
   * This will fail if the current branch is not a pull request and use will get a message to open a pull request.
   */
  const pullRequestId = await getPullRequestId();

  /**
   * Prompt the user for the type of change and a description and a commit option.
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
      message: "Describe the change (don't include the PR number):",
    },
  ]);
  const { commit } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'commit',
      message: 'Do you want to commit the changeset file? (Y or enter for yes)',
      default: true,
    },
  ]);

  /**
   * Create the changeset file.
   */
  try {
    const prLink = `https://github.com/linode/manager/pull/${pullRequestId}`;
    const changesetFile = `${changesetsDirectory}/${Date.now()}-${type
      .toLowerCase()
      .replace(/\s/g, '-')}.md`;
    const changesetContent = `---\n"@linode/manager": ${type}\n---\n\n${description} ([#${pullRequestId}](${prLink}))\n`;

    await writeFileAsync(changesetFile, changesetContent, {
      encoding: 'utf-8',
    });

    logSeparator('green');
    consoleLog(`Changeset created!\n`, 'greenBright');
    consoleLog(changesetFile, 'blue');
    logSeparator('green');
  } catch (error) {
    consoleError(error);
    process.exit(1);
  }

  /**
   * Commit file with generic message if user opts in.
   */
  if (!commit) {
    return;
  }

  try {
    const addCmd = `git add ${changesetFile}`;
    const commitCmd = `git commit -m "Add changeset"`;
    execSync(addCmd);
    execSync(commitCmd);

    logSeparator('green');
    consoleLog(`Changeset committed!:\n${changesetFile}`, 'greenBright');
    logSeparator('green');
  } catch (error) {
    consoleError(error);
    process.exit(1);
  }
}

/**
 * Run the script
 */
generateChangeset();
