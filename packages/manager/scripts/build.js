'use strict';
const buildRequests = require('./buildRequests');
const chalk = require('chalk');

const build = async () => {
  /**
   * Request /types, /types-legacy and /regions and store the values
   * as hard-coded JSON to save network requests on load
   */
  console.log('Caching common requests');
  await buildRequests().then((response) =>
    console.log(
      response === 0
        ? chalk.green('Caching successful\n')
        : chalk.yellow('Caching failed\n')
    )
  );
};

build();
