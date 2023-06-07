import fs from 'fs';
import inquirer from 'inquirer';
import { execSync } from "child_process";
import { getPullRequestId } from "./utils/getPullRequestId.mjs";
import { promisify } from "util";
import { logger } from "./utils/logger.mjs";
import {
  changeSetDirectory,
  CHANGESET_TYPES,
  PACKAGES,
} from "./utils/constants.mjs";

const writeFileAsync = promisify(fs.writeFile);

async function generateChangeset() {
  /**
   * Check if the "gh" command-line tool is installed.
   */
  try {
    execSync("gh version");
  } catch (error) {
    logger.error({
      message: 'Error: The "gh" command-line tool is not installed.',
      info:
        "Please install it from https://github.com/cli/cli#installation\nand sign in with your GitHub account.",
    });
  }

  /**
   * Get the pull request number for the current branch.
   * This will fail if the current branch is not a pull request and use will get a message to open a pull request.
   */
  const pullRequestId = await getPullRequestId();

  /**
   * Prompt the user for the linode package, type of change, a description and a commit option.
   */
  const { linodePackage } = await inquirer.prompt([
    {
      type: "list",
      name: "linodePackage",
      message: "What package is this changeset for? (default: manager)",
      choices: PACKAGES,
      default: "manager",
    },
  ]);
  const { type } = await inquirer.prompt([
    {
      type: "list",
      name: "type",
      message: "What type of change is this?",
      choices: CHANGESET_TYPES,
    },
  ]);
  const { description } = await inquirer.prompt([
    {
      type: "input",
      name: "description",
      message: "Describe the change (don't include the PR number):",
    },
  ]);
  const { commit } = await inquirer.prompt([
    {
      type: "confirm",
      name: "commit",
      message: "Do you want to commit the changeset file? (Y or enter for yes)",
      default: true,
    },
  ]);

  const prLink = `https://github.com/linode/manager/pull/${pullRequestId}`;
  const changesetPath = changeSetDirectory(linodePackage);
  const changesetFile = `${changesetPath}/pr-${pullRequestId}-${type
    .toLowerCase()
    .replace(/\s/g, "-")}-${Date.now()}.md`;
  const changesetContent = `---\n"@linode/${linodePackage}": ${type}\n---\n\n${description} ([#${pullRequestId}](${prLink}))\n`;

  /**
   * Create the changeset file.
   */
  try {
    await writeFileAsync(changesetFile, changesetContent, {
      encoding: "utf-8",
    });
    logger.success({ message: "Changeset created!", info: changesetFile });
  } catch (error) {
    logger.error({ message: error });
  }

  /**
   * Commit file with generic message if user opts in.
   */
  if (!commit) {
    return;
  }

  try {
    const addCmd = `git add ${changesetFile}`;
    const commitCmd = `git commit -m "Added changeset: ${description}"`;
    execSync(addCmd);
    execSync(commitCmd);

    logger.success({ message: "Changeset committed!", info: changesetFile });
  } catch (error) {
    logger.error({ message: error });
  }
}

/**
 * Run the script
 */
generateChangeset();
