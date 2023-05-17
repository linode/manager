import core from '@actions/core';
import github from '@actions/github';

export const findChangesetInPr = async () => {
  try {
    /**
     * We need to fetch all the inputs that were provided to our action
     * and store them in variables for us to use.
     **/
    const owner = core.getInput('owner', { required: true });
    const repo = core.getInput('repo', { required: true });
    const pr_number = core.getInput('pr_number', { required: true });
    const token = core.getInput('token', { required: true });
    const octokit = new github.getOctokit(token, { log: console });

    /**
     * We need to fetch the PR data from GitHub so we can check if the PR has a changeset.
     */
    const { data: PrData } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pr_number,
      mediaType: {
        format: 'diff',
      },
    });

    /**
     * Check if the PR contains a reference to a changeset
     */
    const changesetCommitted = PrData.includes(`pr-${pr_number}`);

    /**
     * Fetch the comments from GitHub and check if the bot has already commented on the PR.
     */
    try {
      const { data: comments } = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: pr_number,
      });

      const changesetBotComment = comments.find((comment) =>
        comment.body.includes('Changeset Found')
      );
      const comment = changesetCommitted
        ? `:heavy_check_mark: **Changeset Found!**\n\nCarry on!`
        : `:warning: **No Changeset Found**\n\nPR #${pr_number} does not have a changeset.\nNot every PR needs one, but if this PR is a user-facing change, or is relevant to an 'Added', 'Fixed', 'Changed', 'Removed' or 'Tech Stories' type, please consider adding one.`;

      /**
       * If the bot has already commented on the PR, we need to update the comment with the new message,
       * else we need to create a new comment.
       */
      if (changesetBotComment) {
        await octokit.rest.issues.updateComment({
          owner,
          repo,
          comment_id: changesetBotComment.id,
          body: comment,
        });
      } else {
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: pr_number,
          body: comment,
        });
      }
    } catch (error) {
      console.warn(`Error posting/updating comments: ${error}`);
      // Not blocking the PR if the bot fails to comment for now.
      // core.setFailed(`Error posting/updating comments: ${error}`);
    }
  } catch (error) {
    // Not blocking the PR if the bot fails to comment for now.
    console.warn(`An error occurred trying to check for a changeset: ${error}`);
    // core.setFailed(
    //   `An error occurred trying to check for a changeset: ${error}`
    // );
  }
};

findChangesetInPr();
