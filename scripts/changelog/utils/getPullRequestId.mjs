import { execSync } from 'child_process';
import { logger } from './logger.mjs';

/**
 * Utility to get the pull request number for the current branch.
 *
 * @requires gh
 */
export const getPullRequestId = async () => {
  try {
    const branchName =
      process.env.GITHUB_HEAD_REF ||
      process.env.GITHUB_REF ||
      // for a local run (not in GitHub Actions)
      execSync('git branch --show-current').toString().trim();
    const prListOutput = execSync(`gh pr list --head ${branchName}`)
      .toString()
      .trim();
    const prNumberMatch = prListOutput.match(/^\s*(\d+)/);

    if (prNumberMatch) {
      return parseInt(prNumberMatch[1], 10);
    } else {
      throw new Error('Pull request number not found.');
    }
  } catch (error) {
    logger.error({
      message:
        "Failed to get pull request number.\nPlease open a pull request for the current branch and let's try this again!",
      info: error,
    });
  }
};
