/**
 * @file Increments Cloud Manager package versions.
 *
 * Usage:
 *
 * package-versions <manager-version> <api-version> <validation-version> <ui-version> <utilities-version> <queries-version> [-f | --force]
 *
 * Positional Parameters:
 * - `<manager-version>`    (Optional) Desired Cloud Manager package version.
 * - `<api-version>`        (Optional) Desired APIv4 package version.
 * - `<validation-version>` (Optional) Desired Validation package version.
 * - `<ui-version>`         (Optional) Desired UI package version.
 * - `<utilities-version>`  (Optional) Desired Utilities package version.
 * - `<queries-version>`    (Optional) Desired Queries package version.
 * - `<shared-version>`     (Optional) Desired Shared package version.
 *
 * Optional Flags:
 * - `-f | --force`         Forces the script to update package versions without
 *                          prompting the user for confirmation. When this is
 *                          specified, the script expects versions for all
 *                          packages to be passed as positional arguments, and
 *                          will fail otherwise.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Command line arguments with executable path and name excluded.
const args = process.argv.slice(2);

/**
 * Package versions that were passed to CLI.
 *
 * @var {string[]}
 */
const desiredVersions = args.filter((arg) => {
  return !arg.startsWith('-');
});

/**
 * CLI flags that modify script behavior.
 *
 * @var {string[]}
 */
const flags = args.filter((arg) => {
  return arg.startsWith('-');
});

/**
 * Path to repository root.
 *
 * @var {string}
 */
const root = path.resolve(import.meta.dirname, '..', '..');

/**
 * Gets the path to the package.json file for the package with the given name.
 *
 * @param {string} packageName - Name of package for which to retrieve path.
 *
 * @returns {string} Package path for `packageName`.
 */
const getPackagePath = (packageName) => {
  return path.join(root, 'packages', packageName, 'package.json');
};

/**
 * Reads input from stdin and returns a Promise that resolves to the input value.
 *
 * @return {Promise<string>}
 */
const readlinePromise = (prompt) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(prompt, (result) => {
      rl.close();
      resolve(result);
    });
  });
}

/**
 * If `true`, packages will be updated using desired versions passed via CLI.
 *
 * In this case, the user is expected to have passed a version number for each
 * package and will not be prompted to specify versions interactively. If the
 * user fails to provide a version for one of the packages, the script will exit
 * with an error.
 *
 * @var {boolean}
 */
const force = flags.includes('-f') || flags.includes('--force');

/**
 * Desired package versions from command line arguments.
 */
const [
  desiredManagerVersion,
  desiredApiVersion,
  desiredValidationVersion,
  desiredUiVersion,
  desiredUtilitiesVersion,
  desiredQueriesVersion,
] = desiredVersions;

// Describes packages that should be modified by this script.
const jobs = [
  { name: 'manager', path: getPackagePath('manager'), desiredVersion: desiredManagerVersion },
  { name: 'api-v4', path: getPackagePath('api-v4'), desiredVersion: desiredApiVersion },
  { name: 'validation', path: getPackagePath('validation'), desiredVersion: desiredValidationVersion },
  { name: 'ui', path: getPackagePath('ui'), desiredVersion: desiredUiVersion },
  { name: 'utilities', path: getPackagePath('utilities'), desiredVersion: desiredUtilitiesVersion },
  { name: 'queries', path: getPackagePath('queries'), desiredVersion: desiredQueriesVersion },
  { name: 'shared', path: getPackagePath('shared'), desiredVersion: desiredSharedVersion },
];

// Describes the files that will be written to, and the changes that will be made.
const writeTasks = [];

// Describes changes that were made by this script. Used to summarize changes
// to the user.
const summary = [];

/**
 * Main script function.
 *
 * This is responsible for interpreting the CLI input, updating package files
 * as needed, and populating the `summary` array so that the results can be
 * displayed to the user.
 *
 * @returns {Promise<void>}
 */
const main = async () => {
  const currentPackageInfo = jobs.map((job) => {
    return {
      name: job.name,
      currentVersion: JSON.parse(fs.readFileSync(job.path, 'utf8')).version || '(No Version)',
    };
  });

  console.info('Package info:');
  console.table(currentPackageInfo);

  for (const job of jobs) {
    const jobName = job.name;
    const jobPath = job.path;
    const jobVersion = job.desiredVersion;

    const packageData = JSON.parse(fs.readFileSync(jobPath));
    const currentVersion = packageData.version;

    let result = undefined;
    if (!force) {
      const suggestedVersion = jobVersion ? jobVersion : (() => {
        // If package doesn't have a version for some reason, suggest `0.1.0`.
        if (!currentVersion) {
          return `0.1.0`;
        }
        // Assumes `major.minor.patch` format, undefined behavior otherwise.
        const [major, minor, patch] = currentVersion.split('.');
        return `${major || 0}.${Number(minor || 0) + 1}.0`;
      })();

      const prompt = `New version for '${jobName}' package? (${suggestedVersion})\n`;
      result = await readlinePromise(prompt);
      if (!result) {
        result = suggestedVersion;
      }
    }
    else {
      if (!jobVersion) {
        throw new Error(`Unable to increment package '${jobName}' version; -f flag was passed but no version was specified for this package`);
      }
      console.info(`Incrementing package '${jobName}' version to '${jobVersion}'`);
      result = jobVersion;
    }

    packageData.version = result;
    const jsonString = `${JSON.stringify(packageData, null, 2)}\n`;

    writeTasks.push({
      name: jobName,
      filepath: jobPath,
      contents: jsonString,
      oldVersion: currentVersion,
      newVersion: result,
    });
  };

  for (const writeTask of writeTasks) {
    try {
      fs.writeFileSync(writeTask.filepath, writeTask.contents);
      summary.push({
        name: writeTask.name,
        oldVersion: writeTask.oldVersion,
        newVersion: writeTask.newVersion,
      });
    }
    catch (e) {
      console.error(e.message);
      console.error(`Unable to write changes to ${writeTask.filepath}`);
    }
  }
};

// Run program, display errors, summary, etc .
(async () => {
  let error = false;
  try {
    await main();
    console.info('Successfully incremented package versions. See the summary below:');
  }
  catch (e) {
    console.error(e.message || 'An unknown error has occurred.');
    console.error('An error has occurred and package versions were not incremented as expected.')
    error = true;
  }
  finally {
    if (summary.length) {
      console.table(summary);
    } else {
      console.info('No changes have been made.');
    }
    if (error) {
      process.exit(1);
    }
  }
})();
