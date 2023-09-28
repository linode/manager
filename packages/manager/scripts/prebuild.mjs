/**
 * This Node script is run during our build process.
 * These endpoints are extremely unlikely to change between
 * Cloud releases, so by including these requests in our build
 * pipeline and reading them as if they were hard coded from the app,
 * we can prevent unnecessary network requests.
 */
import { writeFileSync } from 'fs';

// Always use prod API rather than the variable in /src/constants
const API_ROOT = 'https://api.linode.com/v4/';
const DATA_DIR = 'src/cachedData/';
const cachedRequests = [
  {
    endpoint: 'regions',
    filename: 'regions.json',
  },
  {
    endpoint: 'linode/types-legacy',
    filename: 'typesLegacy.json',
  },
  // Only used for testing purposes, never for displaying data to users
  {
    endpoint: 'linode/kernels',
    filename: 'kernels.json',
  },
  {
    endpoint: 'linode/stackscripts',
    filename: 'marketplace.json',
    filter: [
      {
        '+and': [
          {
            '+or': [
              { username: 'linode-stackscripts' },
              { username: 'linode' },
            ],
          },
          {
            label: {
              '+contains': 'One-Click',
            },
          },
        ],
      },
      { '+order_by': 'ordinal' },
    ],
  },
];

async function handleRequest(endpoint, filename, filter) {
  const response = await fetch(API_ROOT + endpoint + '?page_size=500', {
    headers: filter ? { 'x-filter': JSON.stringify(filter) } : {},
  });
  const data = await response.json();

  if (data.data.pages > 1) {
    throw new Error(
      'Results over 100 will not be retrieved or cached. Aborting.'
    );
  }

  writeFileSync(`${DATA_DIR}${filename}`, JSON.stringify(data));

  console.log(
    `Cached endpoint ${API_ROOT + endpoint} to ${DATA_DIR}${filename}`
  );
}

async function prebuild() {
  /**
   * Request /types, /types-legacy and /regions and store the values
   * as hard-coded JSON to save network requests on load
   */
  console.log('Caching common requests');

  const requests = cachedRequests.map((request) =>
    handleRequest(request.endpoint, request.filename, request.filter)
  );

  try {
    await Promise.all(requests);
    console.log('Caching successful');
  } catch (error) {
    console.error('Caching failed', error);
  }
}

prebuild();
