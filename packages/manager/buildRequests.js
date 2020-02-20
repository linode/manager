/**
 * This Node script is run during our build process.
 * These endpoints are extremely unlikely to change between
 * Cloud releases, so by including these requests in our build
 * pipeline and reading them as if they were hard coded from the app,
 * we can prevent unnecessary network requests.
 */
const axios = require('axios');
const fs = require('fs');

const DATA_DIR = 'src/cachedData/';
// Always use prod API rather than the variable in /src/constants
const API_ROOT = 'https://api.linode.com/v4/';

const handleRequest = (endpoint, filename) => {
  return axios
    .get(API_ROOT + endpoint)
    .then(response => {
      fs.writeFile(`${DATA_DIR}`, JSON.stringify(response.data));
      return 0;
    })
    .catch(err => {
      console.error(err);
      return 1;
    });
};

const cachedRequests = [
  {
    endpoint: 'regions',
    filename: 'regions.json'
  },
  {
    endpoint: 'linode/types',
    filename: 'types.json'
  }
]

const buildRequests = async () => {
  const results = cachedRequests.map(thisRequest => {
    const result = await handleRequest(thisRequest.endpoint, thisRequest.filename);
    return result;
  })
  // Return 0 if everything succeeded, otherwise 1.
  return results.filter(result => result === 1).length > 0 ? 1 : 0;
};

module.exports = buildRequests;
