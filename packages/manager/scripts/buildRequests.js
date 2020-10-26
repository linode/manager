/**
 * This Node script is run during our build process.
 * These endpoints are extremely unlikely to change between
 * Cloud releases, so by including these requests in our build
 * pipeline and reading them as if they were hard coded from the app,
 * we can prevent unnecessary network requests.
 */
const axios = require('axios');
const fs = require('fs');
const bluebird = require('bluebird');

const DATA_DIR = 'src/cachedData/';
// Always use prod API rather than the variable in /src/constants
const API_ROOT = 'https://api.linode.com/v4/';

const handleError = err => {
  if (err) {
    console.error(err);
    return 1;
  }
  return 0;
};

const handleRequest = async (endpoint, filename) => {
  return axios
    .get(API_ROOT + endpoint + '?page_size=500')
    .then(response => {
      /**
       * If this starts beeping, we need to update our
       * request logic to retrieve all available pages.
       */
      if (response.data.pages > 1) {
        console.error(
          'Results over 100 will not be retrieved or cached. Aborting.'
        );
        exit(1);
      }
      return response;
    })
    .then(response => {
      fs.writeFile(
        `${DATA_DIR}${filename}`,
        JSON.stringify(response.data),
        handleError
      );
      return 0;
    })
    .catch(handleError);
};

const cachedRequests = [
  {
    endpoint: 'regions',
    filename: 'regions.json'
  },
  {
    endpoint: 'linode/types-legacy',
    filename: 'typesLegacy.json'
  },
  {
    endpoint: 'linode/types',
    filename: 'types.json'
  },
  // Only used for testing purposes, never for displaying data to users
  {
    endpoint: 'linode/kernels',
    filename: 'kernels.json'
  }
];

const buildRequests = async () => {
  const results = await bluebird.map(cachedRequests, thisRequest =>
    handleRequest(thisRequest.endpoint, thisRequest.filename)
  );
  // Return 0 if everything succeeded, otherwise 1.
  return results.filter(result => result === 1).length > 0 ? 1 : 0;
};

module.exports = buildRequests;
