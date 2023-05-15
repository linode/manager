import { Octokit } from '@octokit/rest';
import { CHANGESET_DIRECTORY } from './utils/constants.mjs';

// Initialize Octokit using a personal access token or GitHub App installation token
const octokit = new Octokit();

async function checkChangeset(owner, repo, prNumber) {
  const changesetFilePath = CHANGESET_DIRECTORY;

  try {
    // Check if the changeset file exists
    const { data: file } = await octokit.repos.getContent({
      owner,
      repo,
      path: changesetFilePath,
      ref: 'develop', // Or the branch you want to check against
    });

    // Changeset file exists
    console.warn(`PR #${prNumber} has a changeset (${file}).`);
  } catch (error) {
    // Changeset file doesn't exist
    console.warn(`PR #${prNumber} does not have a changeset.`);
  }
}

checkChangeset('abailly-akamai', '@linode/manager', '9104');
