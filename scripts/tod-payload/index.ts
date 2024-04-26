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
  .option('-o, --output <str>', 'Optional path to output TOD payload file')

  .action((junitPath: string) => {
    return main(junitPath);
  });

const main = async (junitPath: string) => {
  const resolvedJunitPath = resolve(junitPath);

  // Create an array of absolute file paths to JUnit XML report files.
  const junitFiles = (await fs.readdir(resolvedJunitPath))
    .filter((dirItem: string) => {
      return dirItem.endsWith('.xml')
    })
    .map((dirItem: string) => {
      return resolve(resolvedJunitPath, dirItem);
    });

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
    xunitResults: junitContents.map((junitContent) => {
      return btoa(junitContent);
    }),
  });

  const outputPath = program.opts()['output'];
  if (outputPath) {
    try {
      await fs.writeFile(outputPath, payload);
    }
    catch (e: unknown) {
      console.warn(`Failed to output payload to ${outputPath}`);
    }
  }

  console.log(payload);
};

program.parse(process.argv);
