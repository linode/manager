/**
 * @file Increments Cloud Manager package versions.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const args = process.argv.slice(2);

/**
 * Path to repository root.
 *
 * @var {string}
 */
const root = path.resolve(__dirname, '..', '..');

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
 * Desired package versions from command line arguments.
 */
const [
  desiredManagerVersion,
  desiredApiVersion,
  desiredValidationVersion,
] = args;

const jobs = [
  { name: 'manager', path: getPackagePath('manager'), desiredVersion: desiredManagerVersion },
  { name: 'api-v4', path: getPackagePath('api-v4'), desiredVersion: desiredApiVersion },
  { name: 'validation', path: getPackagePath('validation'), desiredVersion: desiredValidationVersion },
];

const summary = [];

const main = async () => {
  for (job of jobs) {
    const jobName = job.name;
    const jobPath = job.path;
    const jobVersion = job.desiredVersion;

    const packageData = JSON.parse(fs.readFileSync(jobPath));
    const currentVersion = packageData.version;

    const suggestedVersion = jobVersion ? jobVersion : (() => {
      // If package doesn't have a version for some reason, suggest `0.1.0`.
      if (!currentVersion) {
        return `0.1.0`;
      }
      // Assumes `major.minor.patch` format, will fail otherwise.
      const [major, minor, patch] = currentVersion.split('.');
      return `${major}.${Number(minor) + 1}.${patch}`;
    })();

    let result = await readlinePromise(`${jobName} version? (Current ${ currentVersion || '(Not Set)'}, suggested ${ suggestedVersion })`);
    if (!result) {
      result = suggestedVersion;
    }

    packageData.version = result;
    console.info(`Incrementing '${jobName}' version from '${currentVersion}' to '${result}'\n`);
    const jsonString = `${JSON.stringify(packageData, null, 2)}\n`;
    fs.writeFileSync(jobPath, jsonString);
    summary.push({
      name: jobName,
      oldVersion: currentVersion,
      newVersion: result,
    });
  };

  console.log('Incremented package versions:');
  console.table(summary);
};

// Run program.
main();
