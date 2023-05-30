/**
 *
 * THIS SCRIPT IS NOT IN USE AT THE MOMENT
 * It needs to be ported to a github workflow (as opposed to being called from the workflow)
 * as we can't securely use a checkout action on forked pull requests.
 * see https://securitylab.github.com/research/github-actions-preventing-pwn-requests/
 *
 */

import core from '@actions/core';
import github from '@actions/github';

const runChangesetBot = async () => {
  try {
    /**
     * We need to fetch all the inputs that were provided to our action
     * and store them in variables for us to use.
     **/
    const inputs = {
      owner: core.getInput('owner', { required: true }),
      repo: core.getInput('repo', { required: true }),
      pull_number: core.getInput('pr_number', { required: true }),
      token: core.getInput('token', { required: true }),
    };
    const octokit = new github.getOctokit(inputs.token);

    /**
     * We need to fetch the PR data from GitHub so we can check if the PR has a changeset.
     */
    const PrData = await getCurrentPR(inputs, octokit);

    /**
     * Check if the PR contains a reference to a changeset
     */
    const hasChangesetBotComment = PrData?.includes(`pr-${inputs.pull_number}`);
    const comment = hasChangesetBotComment
      ? `:heavy_check_mark: **Changeset Found!**\n\nCarry on!`
      : `:warning: **No Changeset Found**\n\nPR #${inputs.pull_number} does not have a changeset.\nNot every PR needs one, but if this PR is a user-facing change, or is relevant to an "Added", "Fixed", "Changed", "Removed" or "Tech Stories" type, please consider adding one by running \`yarn changeset\``;

    /**
     * Fetch the comments from GitHub and check if the bot has already commented on the PR.
     */
    const comments = await listComments(inputs, octokit);
    const hasChangeset = comments.find((comment) =>
      comment.body.includes('Changeset Found')
    );

    await handleComment(inputs, octokit, hasChangeset, comment);
  } catch (error) {
    console.warn(`An error occurred trying to check for a changeset: ${error}`);
  }
};

const getCurrentPR = async (inputs, octokit) => {
  const { owner, repo, pull_number } = inputs;

  try {
    const { data: PrData } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: {
        format: 'diff',
      },
    });

    return PrData;
  } catch (error) {
    console.warn(`Error fetching PR data: ${error}`);
  }
};

const listComments = async (inputs, octokit) => {
  const { owner, repo, pull_number } = inputs;

  try {
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pull_number,
    });

    return comments;
  } catch (error) {
    console.warn(`Error fetching comments: ${error}`);
  }
};

const handleComment = async (inputs, octokit, hasChangeset, comment) => {
  try {
    const { owner, repo, pull_number } = inputs;
    /**
     * If the bot has already commented on the PR, we need to update the comment with the new message,
     * else we need to create a new comment.
     */
    if (hasChangeset) {
      await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: hasChangeset.id,
        body: comment,
      });
    } else {
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: comment,
      });
    }
  } catch (error) {
    console.warn(`Error posting/updating comments: ${error}`);
  }
};

runChangesetBot();
