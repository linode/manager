import simpleGit from "simple-git";
import { execSync } from "child_process";
import { logger } from "./logger.mjs";

const git = simpleGit();

/**
 * Utility to get the pull request number for the current branch.
 *
 * @requires GitHub CLI tool
 */
export const getPullRequestId = async () => {
  try {
    const branchName =
      process.env.GITHUB_HEAD_REF ||
      process.env.GITHUB_REF ||
      (await git.branchLocal()).current;
    const prListOutput = execSync(`gh pr list --head ${branchName}`)
      .toString()
      .trim();
    const prNumberMatch = prListOutput.match(/^\s*(\d+)/);

    if (prNumberMatch) {
      return parseInt(prNumberMatch[1], 10);
    } else {
      throw new Error("Pull request number not found.");
    }
  } catch (error) {
    logger.error({
      message:
        "Failed to get pull request number.\nPlease open a pull request for the current branch and let's try this again!",
      info: error,
    });
  }
};
