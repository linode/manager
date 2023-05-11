import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import inquirer from 'inquirer';
import MarkdownIt from 'markdown-it';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { readFile } from 'fs/promises';

const md = new MarkdownIt();
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const separator = (color = 'white') =>
  chalk[color]('\n======================================================\n');

// Path to the changesets directory
const changesetsDirectory = path.join(__dirname, '../../.changeset');
// Path to the package.json file
const packageJsonPath = path.join(__dirname, '../../package.json');
// Path to the CHANGELOG.md file
const changelogPath = path.join(__dirname, '../../CHANGELOG.md');

// Read the package.json file
const packageJson = await readFile(packageJsonPath, 'utf-8');
const parsedPackageJson = JSON.parse(packageJson);

// Get the current version from package.json
const currentVersion = parsedPackageJson.version;

const changesetEntries = {};

/**
 * Generates the changelog content with the provided release date and version.
 */
inquirer
  .prompt([
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
  ])
  .then((answers) => {
    const releaseDate = answers.releaseDate;
    const newVersion = incrementMinorVersion(currentVersion);
    const changelogContent = initiateChangelogEntry(releaseDate, newVersion);

    // Parse the changeset files and generate the changelog content
    fs.readdir(changesetsDirectory, (err, files) => {
      if (err) {
        throw err;
      }

      // If only README.md in there, no changeset(s), exit the process
      if (files.length === 1) {
        console.log(separator());
        console.error(chalk.red('No Changeset files found.'));
        console.log(separator());
        process.exit(1);
      }

      try {
        files.forEach((file) => {
          // Skipping the readme file
          if (file === 'README.md') {
            return;
          }

          // Logic to parse the changeset file and generate the changelog content
          const filePath = path.join(changesetsDirectory, file);
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

        // Generate the final changelog content
        populateChangelogEntries(changesetEntries, changelogContent);

        // Read the existing changelog content
        let existingChangelogContent = '';
        if (fs.existsSync(changelogPath)) {
          existingChangelogContent = fs.readFileSync(changelogPath, 'utf-8');
        }

        // Find the index of the first entry
        const firstEntryIndex = existingChangelogContent.indexOf('## [');

        // Prepare the updated changelog content
        let updatedChangelogContent;
        if (firstEntryIndex !== -1) {
          updatedChangelogContent = `${existingChangelogContent.slice(
            0,
            firstEntryIndex
          )}${changelogContent.join('\n')}\n\n${existingChangelogContent.slice(
            firstEntryIndex
          )}`;
        } else {
          updatedChangelogContent = `${changelogContent.join(
            '\n'
          )}\n\n${existingChangelogContent}`;
        }

        // Write the updated changelog content
        fs.writeFileSync(changelogPath, updatedChangelogContent);

        console.log(separator('green'));
        console.error(chalk.greenBright('Changelog generated successfully!'));
        console.log(separator('green'));
      } catch (e) {
        console.log(separator());
        console.error(chalk.red(e));
        console.log(separator());
        process.exit(1);
      }

      // Delete the changeset files
      deleteOldChangesets();
    });
  })
  .catch((error) => {
    console.error(error);
  });

/**
 * Increments the minor version of a semantic version string.
 * @param {string} version - The current version.
 * @returns {string} The new version with the incremented minor version.
 */
function incrementMinorVersion(version) {
  const parts = version.split('.');

  try {
    const minorVersion = parseInt(parts[1], 0);

    parts[1] = (minorVersion + 1).toString();
  } catch (e) {
    console.log(e);
  }

  return parts.join('.');
}

/**
 * Generates the changelog content with the provided release date and version.
 * @param {string} releaseDate - The release date in YYYY-MM-DD format.
 * @param {string} newVersion - The new version.
 * @returns {string[]} The array of lines for the changelog content.
 */
function initiateChangelogEntry(releaseDate, newVersion) {
  const changelogContent = [];

  changelogContent.push(`## [${releaseDate}] - v${newVersion}\n`);

  return changelogContent;
}

/**
 * Populates the changelog content with the provided entries.
 * @param {Object} entries - Entries grouped by type.
 * @param {string[]} changelogContent - The array of lines for the changelog content.
 * @returns {void} Pushes the entries to the changelog content array.
 */
function populateChangelogEntries(entries, changelogContent) {
  try {
    Object.entries(entries)
      .sort()
      .forEach(([type, entries]) => {
        if (entries && entries.length > 0) {
          changelogContent.push(`\n### ${type}:\n`);
          entries.forEach(({ content }) => {
            const tokens = md.parse(content);
            let description = '';
            for (const token of tokens) {
              if (
                token.type === 'inline' &&
                token.content.includes('github.com/linode/manager/pull/')
              ) {
                description = token.content;
                break;
              }
            }

            if (description) {
              changelogContent.push(`- ${description}`);
            }
          });
        }
      });
  } catch (e) {
    console.log(separator());
    console.error(chalk.red(e));
    console.log(separator());
    process.exit(1);
  }
}

/**
 * Populates the changelog content with the provided entries.
 * @returns {void} Deletes the changeset files.
 */
async function deleteOldChangesets() {
  try {
    const files = await readdir(changesetsDirectory);

    for (const file of files) {
      if (file !== 'README.md') {
        const filePath = path.join(changesetsDirectory, file);
        (async () => {
          try {
            await unlink(filePath);
            console.log(`Deleted: ${filePath}`);
          } catch (error) {
            console.error(`Error occurred while deleting ${filePath}:`, error);
          }
        })();
      }
    }

    console.log(separator('green'));
    console.log(chalk.greenBright('Deleted all changesets!'));
    console.log(
      chalk.greenBright('You can now commit the changesets and the changelog.')
    );
    console.log(separator());
  } catch (error) {
    console.error('Error occurred while reading directory:', error);
  }
}
