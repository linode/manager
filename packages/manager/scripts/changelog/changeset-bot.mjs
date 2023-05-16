import { getPullRequestId } from './utils/getPullRequestId.mjs';
import { Octokit } from '@octokit/rest';
import { OWNER, REPO } from './utils/constants.mjs';
import { env } from 'process';

const octokit = new Octokit({
  // Uncomment to debug
  // log: console,
  auth: process.env.GITHUB_TOKEN,
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
      // Get the authenticated user's information
      // const { data: authUser } = await octokit.users.getAuthenticated();
      const { data: comments } = await octokit.issues.listComments({
        owner,
        repo,
        issue_number: pullRequestId,
      });

      const botComment = comments.find(
        // TODO: Change this to the bot's actual username
        (comment) => comment.user.login === 'linode-changeset-bot'
      );

      // console.warn('comments', comments);

      const comment = changesetCommitted
        ? `:heavy_check_mark: **Changeset Found**\n\nPR #${pullRequestId} has a changeset!`
        : `:warning: **No Changeset Found**\n\nPR #${pullRequestId} does not have a changeset.\nNot every PR needs one, but if this PR is a user-facing change, or is relevant to an 'Added', 'Fixed', 'Changed', 'Removed' or 'Tech Stories' type, please consider adding one.`;

      if (botComment) {
        await octokit.issues.updateComment({
          owner,
          repo,
          comment_id: botComment.id,
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
      console.warn(`Error retrieving comments: ${error}`);
    }
  } catch (error) {
    console.warn(`An error occurred trying to check for a changeset: ${error}`);
  }
};

findChangesetInPr({ owner: OWNER, repo: REPO });
