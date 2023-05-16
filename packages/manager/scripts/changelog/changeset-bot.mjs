import { getPullRequestId } from './utils/getPullRequestId.mjs';
import { Octokit } from '@octokit/rest';
import { OWNER, REPO } from './utils/constants.mjs';

const octokit = new Octokit({
  log: console,
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

    if (changesetCommitted) {
      console.warn(`PR #${pullRequestId} has a changeset.`);
    } else {
      console.warn(`PR #${pullRequestId} does not have a changeset.`);
    }
  } catch (error) {
    console.warn(`An error occurred trying to check for a changeset: ${error}`);
  }
};

findChangesetInPr({ owner: OWNER, repo: REPO });
