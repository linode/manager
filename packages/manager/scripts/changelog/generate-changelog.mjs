import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import { deleteChangesets } from './utils/deleteChangesets.mjs';
import { incrementSemver } from './utils/incrementSemver.mjs';
import { initiateChangelogEntry } from './utils/initiateChangelogEntry.mjs';
import { logger } from './utils/logger.mjs';
import { populateChangelogEntry } from './utils/populateChangelogEntry.mjs';
import { readFile } from 'fs/promises';
import {
  CHANGELOG_PATH,
  CHANGESET_DIRECTORY,
  PACKAGE_JSON_PATH,
} from './utils/constants.mjs';

let packageJson;

try {
  packageJson = await readFile(PACKAGE_JSON_PATH, 'utf-8');
} catch (error) {
  logger.error({
    message: 'Error: Could not read package.json file.',
    info: error,
  });
}
const parsedPackageJson = JSON.parse(packageJson);

// Get the current version from package.json
const currentSemver = parsedPackageJson.version;

const changesetEntries = {};

/**
 * Prompt the user for the release date and the type of version bump.
 */
const { releaseDate } = await inquirer.prompt([
  {
    type: 'input',
    name: 'releaseDate',
    message: 'Enter the release date (YYYY-MM-DD):',
    validate: (input) => {
      if (!input.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return 'Please enter a valid date in the format YYYY-MM-DD.';
      }

      return true;
    },
  },
]);
const { semverBump } = await inquirer.prompt([
  {
    type: 'list',
    name: 'semverBump',
    message: 'Choose the type of version bump:',
    choices: ['patch', 'minor', 'major'],
  },
]);

/**
 * Generates the changelog content with the provided release date and version.
 */
const newSemver = incrementSemver(currentSemver, semverBump);
const changelogContent = initiateChangelogEntry(releaseDate, newSemver);

// Parse the changeset files and generate the changelog content
fs.readdir(CHANGESET_DIRECTORY, (err, files) => {
  if (err) {
    throw err;
  }

  // If only README.md in there, no changeset(s), exit the process
  if (files.length === 1) {
    logger.error({ message: 'No Changeset file(s) found!' });
  }

  try {
    files.forEach((file) => {
      // Skipping the README file
      if (file === 'README.md') {
        return;
      }

      // Logic to parse the changeset file and generate the changelog content
      const filePath = path.join(CHANGESET_DIRECTORY, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(/"@linode\/manager": ([^\n]+)/);
      const changesetType = matches ? matches[1].trim() : '';

      if (!changesetEntries[changesetType]) {
        changesetEntries[changesetType] = [];
      }

      changesetEntries[changesetType].push({
        content,
        filePath,
      });
    });
  } catch (error) {
    logger.error({
      message: 'Error occurred while parsing changeset files:',
      info: error,
    });
  }

  // Generate the final changelog content
  populateChangelogEntry(changesetEntries, changelogContent);

  try {
    // Read the existing changelog content
    const existingChangelogContent = fs.readFileSync(CHANGELOG_PATH, 'utf-8');

    // Find the index of the first entry
    const firstEntryIndex = existingChangelogContent.indexOf('## [');

    // Prepare the updated changelog content
    const updatedChangelogContent =
      firstEntryIndex === -1
        ? `${changelogContent.join('\n')}\n\n${existingChangelogContent}`
        : `${existingChangelogContent.slice(
            0,
            firstEntryIndex
          )}${changelogContent.join('\n')}\n\n${existingChangelogContent.slice(
            firstEntryIndex
          )}`;

    // Write the updated changelog content
    fs.writeFileSync(CHANGELOG_PATH, updatedChangelogContent);

    logger.success({ message: 'Changelog generated successfully!' });
  } catch (error) {
    logger.error({
      message: 'Error occurred while generating the changelog.',
      info: error,
    });
  }

  // Delete the changeset files
  deleteChangesets();
});
