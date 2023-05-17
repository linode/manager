import core from '@actions/core';
import github from '@actions/github';

import { BOT } from './utils/constants.mjs';

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
    const octokit = new github.getOctokit(token);

    const { data: PrData } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pr_number,
      mediaType: {
        format: 'diff',
      },
    });
    const changesetCommitted = PrData.includes(`pr-${pr_number}`);

    try {
      const { data: comments } = await octokit.issues.listComments({
        owner,
        repo,
        issue_number: pr_number,
      });

      const changesetBotComment = comments.find(
        (comment) =>
          comment.user.login === BOT && comment.body.includes('Changeset Found')
      );
      const comment = changesetCommitted
        ? `:heavy_check_mark: **Changeset Found!**\n\nThis incredibly attractive PR is getting closer to being released.`
        : `:warning: **No Changeset Found**\n\nPR #${pr_number} does not have a changeset.\nNot every PR needs one, but if this PR is a user-facing change, or is relevant to an 'Added', 'Fixed', 'Changed', 'Removed' or 'Tech Stories' type, please consider adding one.`;

      if (changesetBotComment) {
        await octokit.issues.updateComment({
          owner,
          repo,
          comment_id: changesetBotComment.id,
          body: comment,
        });
      } else {
        await octokit.issues.createComment({
          owner,
          repo,
          issue_number: pr_number,
          body: comment,
        });
      }
    } catch (error) {
      console.warn(`Error posting/updating comments: ${error}`);
    }
  } catch (error) {
    console.warn(`An error occurred trying to check for a changeset: ${error}`);
  }
};

findChangesetInPr();
