/**
 * @file regions.spec.ts
 * @description Fetch and validate /regions API
 */

import type { Dashboard } from '@linode/api-v4';

describe('DBaaS Regions API - Capabilities and Countries', () => {
  const apiRoot = Cypress.env('REACT_APP_API_ROOT');
  const token = Cypress.env('MANAGER_OAUTH');

  // Map of environments to their API → Cloud URL mapping
  const apiRootToCloudMap: Record<string, string> = {
    'https://api.linode.com/v4': 'https://cloud.linode.com/api',
    'https://api.dev.linode.com/v4': 'https://cloud.dev.linode.com',
    'https://api.staging.linode.com/v4': 'https://cloud.staging.linode.com/api',
    'https://api.devcloud.linode.com/v4': 'https://api.devcloud.linode.com',
  };

  // Function to get the cloud base URL from apiRoot
  const getCloudBaseUrl = (apiRoot: string): string =>
    apiRootToCloudMap[apiRoot];

  // Resolve cloud base URL once
  const cloudBaseUrl = getCloudBaseUrl(apiRoot);

  // List of fields to ignore in comparisons (optional)
  const IGNORED_KEYS = ['id', 'created', 'updated', 'uuid', 'timestamp'];

  const assertEqualRecursive = (actual: any, expected: any, path = '') => {
    // Handle undefined/null early
    if (actual === undefined || expected === undefined) {
      expect(actual, `assertpath "${path}" - undefined mismatch`).to.equal(
        expected
      );
      return;
    }

    if (actual === null || expected === null) {
      expect(actual, `assertpath "${path}" - null mismatch`).to.equal(expected);
      return;
    }

    // Handle arrays
    if (Array.isArray(actual) && Array.isArray(expected)) {
      expect(actual.length, `assertpath "${path}" - array length`).to.equal(
        expected.length
      );
      actual.forEach((item, idx) => {
        assertEqualRecursive(item, expected[idx], `${path}[${idx}]`);
      });
      return;
    }

    // One is array, the other is not
    if (Array.isArray(actual) !== Array.isArray(expected)) {
      throw new Error(
        `assertpath "${path}" - type mismatch: one is array, the other isn't`
      );
    }

    // Handle objects
    if (typeof actual === 'object' && typeof expected === 'object') {
      const actualKeys = Object.keys(actual)
        .filter((k) => !IGNORED_KEYS.includes(k))
        .sort();
      const expectedKeys = Object.keys(expected)
        .filter((k) => !IGNORED_KEYS.includes(k))
        .sort();

      // Compute differences
      const extraInApi = actualKeys.filter((k) => !expectedKeys.includes(k));
      const missingInApi = expectedKeys.filter((k) => !actualKeys.includes(k));

      if (extraInApi.length || missingInApi.length) {
        // Log clearer diff info
        cy.log(`❌ Key mismatch at path "${path}"`);
        if (extraInApi.length)
          cy.log(`Extra keys in API: ${JSON.stringify(extraInApi)}`);
        if (missingInApi.length)
          cy.log(`Missing keys in API: ${JSON.stringify(missingInApi)}`);

        throw new Error(
          `assertpath "${path}" - object keys mismatch.\n` +
            (extraInApi.length
              ? `Extra keys in API: ${extraInApi.join(', ')}\n`
              : '') +
            (missingInApi.length
              ? `Missing keys in API: ${missingInApi.join(', ')}`
              : '')
        );
      }

      // Recurse through all keys
      expectedKeys.forEach((key) => {
        assertEqualRecursive(
          actual[key],
          expected[key],
          path ? `${path}.${key}` : key
        );
      });
      return;
    }

    // Primitive comparison
    expect(actual, `assertpath "${path}" - value`).to.equal(expected);
  };

  ['dbaas', 'firewall', 'nodebalancer', 'objectstorage', 'linode'].forEach(
    (type) => {
      it.only(`should fetch ${type.toUpperCase()} dashboards successfully`, () => {
        const requestUrl = `${cloudBaseUrl}/v4beta/monitor/services/${type}/dashboards`;
        const templatePath = `${Cypress.config('fileServerFolder')}/cypress/e2e/core/cloudpulse/api-response/${type}-dashboard-response.json`;

        cy.readFile(templatePath).then((templateData) => {
          cy.request({
            method: 'GET',
            url: requestUrl,
            headers: {
              Accept: 'application/json, text/plain, */*',
              Authorization: `Bearer ${token}`,
            },
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('data');
            assertEqualRecursive(response.body.data, templateData.data);
          });
        });
      });
    }
  );

  const services = [
    { type: 'dbaas', id: 1 },
    { type: 'nodebalancer', id: 3 },
    { type: 'firewall', id: 4 },
    { type: 'objectstorage', id: 6 },
    { type: 'linode', id: 2 },
  ];

  services.forEach(({ type, id }) => {
    it.only(`should fetch ${type.toUpperCase()} dashboard by ID successfully`, () => {
      const requestUrl = `${cloudBaseUrl}/v4beta/monitor/dashboards/${id}`;
      const templatePath = `${Cypress.config('fileServerFolder')}/cypress/e2e/core/cloudpulse/api-response/${type}-dashboard-response.json`;

      cy.readFile(templatePath).then((templateData) => {
        cy.request({
          method: 'GET',
          url: requestUrl,
          headers: {
            Accept: 'application/json, text/plain, */*',
            Authorization: `Bearer ${token}`,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);

          // Normalize both responses into single objects
          const normalizeToObject = (
            data: Dashboard | Dashboard[] | { data: Dashboard[] }
          ): Dashboard => {
            if (Array.isArray(data)) {
              // Already an array, take first item
              return data[0];
            }

            if ('data' in data && Array.isArray(data.data)) {
              // Wrapped in { data: Dashboard[] }
              return data.data[0];
            }

            // Must be a single Dashboard object
            return data as Dashboard;
          };

          const apiStripped = normalizeAndStripTimestamps(
            normalizeToObject(response.body)
          );
          const templateStripped = normalizeAndStripTimestamps(
            normalizeToObject(templateData)
          );

          assertEqualRecursive(apiStripped, templateStripped);
        });
      });
    });
  });

  const normalizeAndStripTimestamps = (input: Dashboard): Dashboard => {
    if (!input || typeof input !== 'object') return input;

    // List of fields to remove
    const fieldsToRemove = ['created', 'updated', 'page', 'pages', 'results'];

    return Object.fromEntries(
      Object.entries(input).filter(([key]) => !fieldsToRemove.includes(key))
    ) as Dashboard;
  };
});
