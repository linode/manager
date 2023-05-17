import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { getPullRequestId } from './utils/getPullRequestId.mjs';
import { Octokit } from '@octokit/rest';
import { BOT, OWNER, REPO } from './utils/constants.mjs';

const octokit = new Octokit({
  // Uncomment to debug
  log: console,
  auth: process.env.GH_TOKEN,
});

export const findChangesetInPr = async ({ owner, repo }) => {
  try {
    const pullRequestId = await getPullRequestId();
    const { data: PrData } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullRequestId,
      mediaType: {
        format: 'diff',
      },
    });
    const changesetCommitted = PrData.includes(`pr-${pullRequestId}`);

    try {
      const { data: comments } = await octokit.issues.listComments({
        owner,
        repo,
        issue_number: pullRequestId,
      });

      const changesetBotComment = comments.find(
        (comment) =>
          comment.user.login === BOT && comment.body.includes('Changeset Found')
      );
      const comment = changesetCommitted
        ? `:heavy_check_mark: **Changeset Found!**\n\nThis incredibly attractive PR is getting closer to being released.`
        : `:warning: **No Changeset Found**\n\nPR #${pullRequestId} does not have a changeset.\nNot every PR needs one, but if this PR is a user-facing change, or is relevant to an 'Added', 'Fixed', 'Changed', 'Removed' or 'Tech Stories' type, please consider adding one.`;

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
          issue_number: pullRequestId,
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

findChangesetInPr({ owner: OWNER, repo: REPO });
