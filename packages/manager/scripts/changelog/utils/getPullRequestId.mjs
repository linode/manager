import process from 'process';
import { execSync } from 'child_process';
import { consoleError, logSeparator } from './chalk.mjs';

/**
 * Utility to get the pull request number for the current branch.
 *
 * @requires gh
 */
export const getPullRequestId = async () => {
  try {
    const branchName = execSync('git branch --show-current').toString().trim();
    const prListOutput = execSync(`gh pr list --head ${branchName}`)
      .toString()
      .trim();
    const prNumberMatch = prListOutput.match(/^\s*(\d+)/);

    return prNumberMatch ? parseInt(prNumberMatch[1], 10) : NaN;
  } catch (error) {
    logSeparator();
    consoleError(
      "Failed to get pull request number.\nPlease open a pull request for the current branch and let's try this again!"
    );
    logSeparator();
    process.exit(1);
  }
};
