/**
 * @file Script to generate a TOD test results payload given a path containing JUnit XML files.
 */

import { program } from 'commander';
import * as fs from 'fs/promises';
import { resolve } from 'path';

program
  .name('tod-payload')
  .description('Output TOD test result payload')
  .version('0.1.0')
  .arguments('<junitPath>')
  .option('-n, --appName <str>', 'Application name')
  .option('-b, --appBuild <str>', 'Application build identifier')
  .option('-u, --appBuildUrl <str>', 'Application build URL')
  .option('-v, --appVersion <str>', 'Application version')
  .option('-t, --appTeam <str>', 'Application team name')
  .option('-f, --fail', 'Treat payload as failure')
  .option('-T, --tag <str>', 'Optional tag for run')

  .action((junitPath: string) => {
    return main(junitPath);
  });

const main = async (junitPath: string) => {
  const resolvedJunitPath = resolve(import.meta.dirname, '..', '..', junitPath);

  // Create an array of absolute file paths to JUnit XML report files.
  // Account for cases where `resolvedJunitPath` is a path to a directory
  // or a path to an individual JUnit file.
  const junitFiles = await (async () => {
    const stats = await fs.lstat(resolvedJunitPath);
    if (stats.isDirectory()) {
      return (await fs.readdir(resolvedJunitPath))
        .filter((dirItem: string) => {
          return dirItem.endsWith('.xml')
        })
        .map((dirItem: string) => {
          return resolve(resolvedJunitPath, dirItem);
        });
    }
    return [resolvedJunitPath];
  })();

  // Read all of the JUnit files.
  const junitContents = await Promise.all(junitFiles.map((junitFile) => {
    return fs.readFile(junitFile, 'utf8');
  }));

  const payload = JSON.stringify({
    team: program.opts()['appTeam'],
    name: program.opts()['appName'],
    buildName: program.opts()['appBuild'],
    semanticVersion: program.opts()['appVersion'],
    buildUrl: program.opts()['appBuildUrl'],
    pass: !program.opts()['fail'],
    tag: !!program.opts()['tag'] ? program.opts()['tag'] : undefined,
    xunitResults: junitContents.map((junitContent) => {
      return btoa(junitContent);
    }),
  });

  console.log(payload);
};

program.parse(process.argv);
