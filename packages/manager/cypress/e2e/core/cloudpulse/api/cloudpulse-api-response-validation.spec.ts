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

  // Then loop through service types to fetch dashboards
  // Strip dynamic fields before comparison
  const stripTimestamps = (dashboards: Array<Record<string, unknown>>) =>
    dashboards.map(({ created: _created, updated: _updated, ...rest }) => rest);

  ['dbaas', 'firewall', 'nodebalancer'].forEach((type) => {
    it(`should fetch ${type.toUpperCase()} dashboards successfully`, () => {
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

          const apiStripped = stripTimestamps(response.body.data);
          const templateStripped = stripTimestamps(templateData.data);

          // Validate after logging
          expect(apiStripped).to.deep.equal(templateStripped);
        });
      });
    });
  });

  const services = [
    { type: 'dbaas', id: 1 },
    { type: 'nodebalancer', id: 3 },
  ];

  services.forEach(({ type, id }) => {
    it(`should fetch ${type.toUpperCase()} dashboard by ID successfully`, () => {
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

          expect(apiStripped).to.deep.equal(templateStripped);
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
