/**
 * @file Cypress intercepts and mocks for Cloud Manager feature flags.
 */

import { getResponseDataFromMockData } from 'support/util/feature-flags';
import {
  launchDarklyUrlPattern,
  launchDarklyClientstreamPattern,
} from 'support/constants/feature-flags';

import type { FeatureFlagMockData } from 'support/util/feature-flags';

/**
 * Intercepts GET request to feature flag clientstream URL and mocks the response.
 *
 * This blocks Cloud Manager from initiating a stream with our feature flag
 * service, preventing our mocks from being overridden.
 */
export const mockGetFeatureFlagClientstream = () => {
  return cy.intercept('GET', launchDarklyClientstreamPattern, {});
};

/**
 * Intercepts GET request to fetch feature flags and modifies the response.
 *
 * The given feature flag mock data is merged with the actual response data so
 * that existing but unrelated feature flags are unmodified.
 *
 * The response from LaunchDarkly is not modified if the status code is
 * anything other than 200.
 *
 * @param featureFlags - Feature flag mock data with which to append response.
 *
 * @returns Cypress chainable.
 */
export const mockAppendFeatureFlags = (
  featureFlags: FeatureFlagMockData
): Cypress.Chainable => {
  const mockFeatureFlagResponse = getResponseDataFromMockData(featureFlags);

  return cy.intercept('GET', launchDarklyUrlPattern, (req) => {
    req.continue((res) => {
      if (res.statusCode === 200) {
        res.body = {
          ...res.body,
          ...mockFeatureFlagResponse,
        };
      }
    });
  });
};
