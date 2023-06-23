import simpleGit from 'simple-git';
import { logger } from './logger.mjs';

const git = simpleGit();

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
      (await git.branchLocal()).current;
    const prListOutput = await git.raw(['pr', 'list', '--head', branchName]);
    const prNumberMatch = prListOutput.trim().match(/^\s*(\d+)/);

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
