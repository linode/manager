import fs from 'fs';
import inquirer from 'inquirer';
import { execSync } from "child_process";
import { promisify } from "util";
import { logger } from "./utils/logger.mjs";
import {
  changesetDirectory,
  CHANGESET_TYPES,
  PACKAGES,
} from "./utils/constants.mjs";

const writeFileAsync = promisify(fs.writeFile);

async function generateChangeset() {
  /**
   * Prompt the user for the Bitbucket PR ID.
   */
  const { pullRequestId } = await inquirer.prompt([
    {
      type: "input",
      prefix: `🔗 Bitbucket PR`,
      name: "pullRequestId",
      message: "\nEnter the Bitbucket PR number:",
      validate: (input) => {
        const trimmed = input.trim();
        if (!/^[0-9]+$/.test(trimmed)) {
          return "PR number must be a number.";
        }
        return true;
      },
    },
  ]);

  /**
   * Prompt the user for the linode package, type of change, a description and a commit option.
   */
  const { linodePackage } = await inquirer.prompt([
    {
      type: "list",
      prefix: `📦 Linode Package`,
      name: "linodePackage",
      message: "\nWhat package is this changeset for? (default: manager)",
      choices: PACKAGES,
      default: "manager",
    },
  ]);
  const { type } = await inquirer.prompt([
    {
      type: "list",
      prefix: `🆕 Semver`,
      name: "type",
      message: "\nWhat type of change is this?",
      choices: CHANGESET_TYPES,
    },
  ]);
  const { description } = await inquirer.prompt([
    {
      type: "input",
      prefix: `📝 Description`,
      name: "description",
      message: "\nBriefly describe the change (see https://linode.github.io/manager/CONTRIBUTING.html#writing-a-changeset for best practices):",
      validate: (input) => {
        const trimmed = input.trim();

        if (trimmed.length < 1) {
          return "Description must be between 1-150 characters. Please add a description.";
        }

        if (trimmed.length > 150) {
          return "Description must be no more than 150 characters. Please summarize your changes.";
        }

        if (/#[0-9]+/.test(trimmed) || /\bPR\s?#?\d+\b/i.test(trimmed)) {
          return "Description should not include the PR number (e.g., #123 or PR 456).";
        }

        if (!/^[A-Z]/.test(trimmed)) {
          return "Description should start with a capital letter.";
        }

        if (/[.]$/.test(trimmed)) {
          return "Description should not end with a period.";
        }

        return true;
      },
    },
  ]);
  const { commit } = await inquirer.prompt([
    {
      type: "confirm",
      prefix: `✅ Commit`,
      name: "commit",
      message:
        "\nDo you want to commit the changeset file? (Y or enter for yes)",
      default: true,
    },
  ]);

  const prLink = `https://git.source.akamai.com/projects/FEE/repos/cloud-manager/pull-requests/${pullRequestId}`;
  const changesetPath = changesetDirectory(linodePackage);
  const changesetFile = `${changesetPath}/pr-${pullRequestId}-${type
    .toLowerCase()
    .replace(/\s/g, "-")}-${Date.now()}.md`;
  const changesetContent = `---\n"${linodePackage === 'cloudpulse' ? `@akamai/${linodePackage}` : `@linode/${linodePackage}`}": ${type}\n---\n\n${description} ([#${pullRequestId}](${prLink}))\n`;

  /**
   * Create the changeset file.
   */
  try {
    await writeFileAsync(changesetFile, changesetContent, {
      encoding: "utf-8",
    });
    logger.success({ message: "🚀 Changeset created!", info: changesetFile });
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
    const addCmd = `git add "${changesetFile}"`;
    // This allows backticks in the commit message. We first need to sanitize against any number of backslashes
    // that appear before backtick in description, to avoid having unescaped characters. Then we can add back
    // two backslashes before the backtick to make sure backticks show up in the commit message.
    const escapedDescription = description.replace(/\\*`/g, "\\`");
    const commitCmd = `git commit -m "Added changeset: ${escapedDescription}"`;
    execSync(addCmd);
    execSync(commitCmd);

    logger.success({ message: "✅ Changeset committed!", info: changesetFile });
  } catch (error) {
    logger.error({ message: error });
  }
}

/**
 * Run the script
 */
generateChangeset();
