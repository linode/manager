/**
 * @file Cypress intercepts and mocks for Cloud Manager feature flags.
 */

import { makeResponse } from 'support/util/response';
import type { FeatureFlagResponseData } from 'support/util/feature-flags';

// LaunchDarkly URL pattern for feature flag retrieval.
const launchDarklyUrlPattern =
  'https://app.launchdarkly.com/sdk/evalx/*/users/*';

/**
 * Intercepts GET request to fetch feature flags and modifies the response.
 *
 * The given feature flag data is merged with the actual response data so that
 * existing but unrelated feature flags are left intact.
 *
 * The response from LaunchDarkly is not modified if the status code is
 * anything other than 200.
 *
 * @param featureFlags - Feature flag response data with which to append response.
 *
 * @returns Cypress chainable.
 */
export const mockAppendFeatureFlags = (
  featureFlags: FeatureFlagResponseData
): Cypress.Chainable => {
  return cy.intercept('GET', launchDarklyUrlPattern, (req) => {
    req.continue((res) => {
      if (res.statusCode === 200) {
        res.body = {
          ...res.body,
          ...featureFlags,
        };
      }
    });
  });
};

/**
 * Intercepts GET request to fetch feature flags and mocks the response.
 *
 * @param featureFlags - Feature flag response data with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetFeatureFlags = (
  featureFlags: FeatureFlagResponseData
): Cypress.Chainable => {
  return cy.intercept(
    'GET',
    launchDarklyUrlPattern,
    makeResponse(featureFlags)
  );
};
