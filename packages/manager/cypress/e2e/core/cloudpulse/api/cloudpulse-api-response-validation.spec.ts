/**
 * @file cloudpulse-api.spec.ts
 * @description Self-contained Cypress tests for /monitor dashboards and metric-definitions.
 */

import type { Dashboard } from '@linode/api-v4';

describe('CloudPulse API - Dashboards and Metric Definitions', () => {
  const apiRoot = Cypress.env('REACT_APP_API_ROOT');
  const token = Cypress.env('MANAGER_OAUTH');

  // Map of environments to their corresponding Cloud URLs
  const apiRootToCloudMap: Record<string, string> = {
    'https://api.linode.com/v4': 'https://cloud.linode.com/api',
    'https://api.dev.linode.com/v4': 'https://cloud.dev.linode.com',
    'https://api.staging.linode.com/v4': 'https://cloud.staging.linode.com/api',
    'https://api.devcloud.linode.com/v4': 'https://api.devcloud.linode.com',
  };

  const cloudBaseUrl =
    apiRootToCloudMap[apiRoot] ?? apiRoot.replace('api.', 'cloud.');

  const IGNORED_KEYS = [
    'id',
    'uuid',
    'created',
    'updated',
    'timestamp',
    'page',
    'pages',
    'results',
  ];
  const UNORDERED_ARRAY_PATHS = [
    'available_aggregate_functions',
    'dimensions.values',
  ];

  // -----------------------------
  // Recursive deep comparison
  // -----------------------------
  const assertDeepEqual = (
    actual: unknown,
    expected: unknown,
    path = '',
    ignoreKeys: string[] = IGNORED_KEYS,
    unorderedPaths: string[] = UNORDERED_ARRAY_PATHS
  ) => {
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

    if (Array.isArray(actual) && Array.isArray(expected)) {
      const unordered = unorderedPaths.some((p) => path.endsWith(p));
      if (unordered) {
        const sortByStringify = (a: any, b: any) =>
          JSON.stringify(a).localeCompare(JSON.stringify(b));
        const actualSorted = [...actual].sort(sortByStringify);
        const expectedSorted = [...expected].sort(sortByStringify);
        expect(
          actualSorted,
          `assertpath "${path}" - unordered array mismatch`
        ).to.deep.equal(expectedSorted);
      } else {
        expect(actual.length, `assertpath "${path}" - array length`).to.equal(
          expected.length
        );
        actual.forEach((item, idx) => {
          assertDeepEqual(
            item,
            expected[idx],
            `${path}[${idx}]`,
            ignoreKeys,
            unorderedPaths
          );
        });
      }
      return;
    }

    if (Array.isArray(actual) !== Array.isArray(expected)) {
      throw new Error(
        `assertpath "${path}" - type mismatch: one is array, the other isn't`
      );
    }

    if (typeof actual === 'object' && typeof expected === 'object') {
      const actualKeys = Object.keys(actual)
        .filter((k) => !ignoreKeys.includes(k))
        .sort();
      const expectedKeys = Object.keys(expected)
        .filter((k) => !ignoreKeys.includes(k))
        .sort();

      const extraInApi = actualKeys.filter((k) => !expectedKeys.includes(k));
      const missingInApi = expectedKeys.filter((k) => !actualKeys.includes(k));

      if (extraInApi.length || missingInApi.length) {
        cy.log(`❌ Key mismatch at path "${path}"`);
        if (extraInApi.length)
          cy.log(`Extra keys: ${JSON.stringify(extraInApi)}`);
        if (missingInApi.length)
          cy.log(`Missing keys: ${JSON.stringify(missingInApi)}`);
        throw new Error(
          `assertpath "${path}" - object keys mismatch.\n` +
            (extraInApi.length
              ? `Extra keys: ${extraInApi.join(', ')}\n`
              : '') +
            (missingInApi.length
              ? `Missing keys: ${missingInApi.join(', ')}`
              : '')
        );
      }

      expectedKeys.forEach((key) => {
        assertDeepEqual(
          actual[key],
          expected[key],
          path ? `${path}.${key}` : key,
          ignoreKeys,
          unorderedPaths
        );
      });
      return;
    }

    expect(actual, `assertpath "${path}" - value`).to.equal(expected);
  };

  // -----------------------------
  // Recursive timestamp/page stripping
  // -----------------------------
  const stripKeysRecursively = (obj: any, fieldsToRemove: string[]): any => {
    if (Array.isArray(obj))
      return obj.map((item) => stripKeysRecursively(item, fieldsToRemove));
    if (typeof obj !== 'object' || obj === null) return obj;

    const filtered = Object.fromEntries(
      Object.entries(obj).filter(([key]) => !fieldsToRemove.includes(key))
    );

    return Object.fromEntries(
      Object.entries(filtered).map(([key, value]) => [
        key,
        stripKeysRecursively(value, fieldsToRemove),
      ])
    );
  };

  const normalizeDashboard = (
    data: Dashboard | Dashboard[] | { data: Dashboard[] }
  ): Dashboard => {
    if (Array.isArray(data)) return data[0];
    if ('data' in data && Array.isArray(data.data)) return data.data[0];
    return data as Dashboard;
  };

  // Log failures in CI
  Cypress.on('fail', (err) => {
    cy.log(`🔥 Assertion failed: ${err.message}`);
    throw err;
  });

  const services = [
    { type: 'dbaas', id: 1 },
    { type: 'nodebalancer', id: 3 },
    { type: 'firewall', id: 4 },
    { type: 'objectstorage', id: 6 },
    { type: 'linode', id: 2 },
  ];

  // -----------------------------
  // Dashboards tests
  // -----------------------------
  context('Dashboards', () => {
    ['dbaas', 'firewall', 'nodebalancer', 'objectstorage', 'linode'].forEach(
      (type) => {
        it(`should fetch ${type.toUpperCase()} dashboards`, () => {
          const url = `${cloudBaseUrl}/v4beta/monitor/services/${type}/dashboards`;
          const templatePath = `${Cypress.config('fileServerFolder')}/cypress/e2e/core/cloudpulse/api-response/${type}-dashboard-response.json`;

          cy.readFile(templatePath).then((templateData) => {
            cy.request({
              method: 'GET',
              url,
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => {
              expect(res.status).to.eq(200);
              expect(res.body).to.have.property('data');
              assertDeepEqual(res.body.data, templateData.data);
            });
          });
        });
      }
    );

    services.forEach(({ type, id }) => {
      it(`should fetch ${type.toUpperCase()} dashboard by ID`, () => {
        const url = `${cloudBaseUrl}/v4beta/monitor/dashboards/${id}`;
        const templatePath = `${Cypress.config('fileServerFolder')}/cypress/e2e/core/cloudpulse/api-response/${type}-dashboard-response.json`;

        cy.readFile(templatePath).then((templateData) => {
          cy.request({
            method: 'GET',
            url,
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => {
            expect(res.status).to.eq(200);
            const apiNormalized = stripKeysRecursively(
              normalizeDashboard(res.body),
              IGNORED_KEYS
            );
            const templateNormalized = stripKeysRecursively(
              normalizeDashboard(templateData),
              IGNORED_KEYS
            );

            assertDeepEqual(apiNormalized, templateNormalized);
          });
        });
      });
    });
  });

  // -----------------------------
  // Metric Definitions tests
  // -----------------------------
  context('Metric Definitions', () => {
    ['dbaas', 'objectstorage', 'linode', 'firewall', 'nodebalancer'].forEach(
      (type) => {
        it(`should fetch ${type.toUpperCase()} metric definitions`, () => {
          const url = `${cloudBaseUrl}/v4beta/monitor/services/${type}/metric-definitions`;
          const templatePath = `${Cypress.config('fileServerFolder')}/cypress/e2e/core/cloudpulse/api-response/${type}-metric-definition.json`;

          cy.readFile(templatePath).then((templateData) => {
            cy.request({
              method: 'GET',
              url,
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => {
              expect(res.status).to.eq(200);
              expect(res.body).to.have.property('data');
              assertDeepEqual(
                res.body.data,
                templateData.data,
                '',
                IGNORED_KEYS,
                UNORDERED_ARRAY_PATHS
              );
            });
          });
        });
      }
    );
  });
});
