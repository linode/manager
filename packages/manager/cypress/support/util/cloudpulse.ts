// Function to generate random values based on the number of points

import type { Stats } from '@linode/api-v4';
import type { CloudPulseMetricsResponseData } from '@linode/api-v4';
import type { Labels } from 'src/features/CloudPulse/shared/CloudPulseTimeRangeSelect';

export const generateRandomMetricsData = (
  time: Labels,
  granularityData: '1 day' | '1 hr' | '5 min' | 'Auto'
): CloudPulseMetricsResponseData => {
  const currentTime = Math.floor(Date.now() / 1000);

  const intervals: Record<string, number> = {
    ['1 day']: 86400,
    ['1 hr']: 3600,
    ['5 min']: 5 * 60,
    ['Auto']: 3600,
  };

  const timeRanges: Record<string, number> = {
    ['Last 7 Days']: 7 * 24 * 3600,
    ['Last 12 Hours']: 12 * 3600,
    ['Last 24 Hours']: 24 * 3600,
    ['Last 30 Days']: 30 * 24 * 3600,
    ['Last 30 Minutes']: 30 * 60,
  };

  const interval = intervals[granularityData];
  const timeRangeInSeconds = timeRanges[time];
  const startTime = currentTime - timeRangeInSeconds;

  if (!timeRangeInSeconds) {
    throw new Error(`Unsupported time range: ${time}`);
  }

  if (!interval) {
    throw new Error(`Unsupported interval: ${interval}`);
  }

  const values: [number, string][] = Array.from(
    { length: Math.ceil(timeRangeInSeconds / interval) + 1 },
    (_, i) => {
      const timestamp = startTime + i * interval;
      const value = (Math.round(Math.random() * 100 * 100) / 100).toFixed(2); // Round and convert to string with 2 decimal places
      return [timestamp, value];
    }
  );
  return {
    result: [{ metric: {}, values }],
    result_type: 'matrix',
  };
};

/*
Common assertions for multiple tests w/ different setups which
assume legacy metrics will be displayed
with no option to view beta metrics
*/
export const assertBetaMetricsNotAvailable = () => {
  cy.wait([
    '@getFeatureFlags',
    '@getUserPreferences',
    '@getRegions',
    '@getLinode',
    '@getLinodeStats',
  ]);
  // tab header is "Metrics", not "Metrics Beta"
  cy.get('[data-testid="Metrics"]')
    .should('be.visible')
    .should('be.enabled')
    .within(() => {
      cy.get('[data-testid="betaChip"]').should('not.exist');
    });
  cy.get('[data-reach-tab-panels]')
    .should('be.visible')
    .within(() => {
      // banner and button to switch to beta do not exist
      cy.get('[data-testid="metrics-preference-banner-text"]').should(
        'not.exist'
      );
      cy.findByText('Try the Metrics (Beta)').should('not.exist');
      // legacy metrics view of LinodeSummary component is displayed
      cy.get('[data-testid="linode-summary"]').should('be.visible');
    });
};

export const generateMockLegacyStats = (): Stats => {
  const generateStats = (modifier = 1): [number, number][] => {
    const stat: [number, number][] = [];
    let i = 0;
    for (i; i < 200; i++) {
      const item: [number, number] = [0, 0];
      item[0] = Date.now() - i * 300000;
      item[1] = Math.random() * modifier;
      stat.push(item);
    }
    return stat;
  };
  const netStats = {
    in: generateStats(3),
    out: generateStats(2),
    private_in: generateStats(0),
    private_out: generateStats(0),
  };
  return {
    data: {
      cpu: generateStats(4),
      io: { io: generateStats(3), swap: generateStats(3) },
      netv4: netStats,
      netv6: netStats,
    },
    title: 'mock title',
  };
};

/**
 * Utility that recursively compares two preference objects and returns an array of mismatches.
 *
 * This function deeply traverses both `actual` and `expected` objects, comparing:
 * - Primitive values for equality
 * - Arrays for length and element-by-element matches
 * - Nested objects for structural and value equality
 *
 * It does **not** mutate inputs or throw errors — instead, it returns a list of
 * human-readable mismatch descriptions, which can be used for debugging or
 * validation in tests.
 *
 * Example:
 * ```ts
 * const errors = comparePreferencesDeep(actualPref, expectedPref);
 * if (errors.length > 0) {
 *   throw new Error(`Preference mismatch:\n${errors.join('\n')}`);
 * }
 * ```
 *
 * @template T - Type of the preference object (usually Record<string, unknown>)
 * @param actual - The actual preference object received (e.g., from API response)
 * @param expected - The expected preference object to compare against
 * @param path - Internal recursive key path (used for error trace readability)
 * @returns {string[]} A list of mismatch messages (empty if both objects match)
 */
export const comparePreferences = <T extends Record<string, unknown>>(
  actual: T,
  expected: T,
  path = '',
  errors: string[] = []
): void => {
  Object.keys(expected).forEach((key) => {
    const fullPath = path ? `${path}.${key}` : key;
    const expectedValue = expected[key as keyof T];
    const actualValue = actual?.[key as keyof T];

    // Key missing
    if (!(key in (actual || {}))) {
      errors.push(`Missing key: ${fullPath}`);
      return;
    }

    // Nested object (not array)
    if (
      expectedValue &&
      typeof expectedValue === 'object' &&
      !Array.isArray(expectedValue)
    ) {
      comparePreferences(
        actualValue as Record<string, unknown>,
        expectedValue as Record<string, unknown>,
        fullPath,
        errors
      );
      return;
    }

    // Array comparison
    if (Array.isArray(expectedValue)) {
      if (!Array.isArray(actualValue)) {
        errors.push(`🔸 ${fullPath} should be an array`);
      } else if (
        JSON.stringify(actualValue) !== JSON.stringify(expectedValue)
      ) {
        errors.push(
          `🔸 Array mismatch at ${fullPath}: expected ${JSON.stringify(
            expectedValue
          )} but got ${JSON.stringify(actualValue)}`
        );
      }
      return;
    }

    // Primitive comparison
    if (expectedValue !== actualValue) {
      errors.push(
        `🔸 Value mismatch at ${fullPath}: expected "${expectedValue}" but got "${actualValue}"`
      );
    }
  });

  // Show all mismatches at the end
  if (path === '' && errors.length > 0) {
    cy.log(errors.join('\n'));
    throw new Error(`Found ${errors.length} mismatches:\n${errors.join('\n')}`);
  }
};