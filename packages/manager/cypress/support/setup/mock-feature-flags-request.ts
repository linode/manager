/**
 * @file Intercepts and mocks Launch Darkly feature flag requests with override data if specified.
 */

import { launchDarklyUrlPattern } from 'support/constants/feature-flags';

/**
 * If feature flag overrides have been specified, intercept every LaunchDarkly
 * feature flag request and modify the response to contain the override data.
 *
 * This override happens before other intercepts and mocks (e.g. via `mockGetFeatureFlags`
 * and `mockAppendFeatureFlags`), so mocks set up by those functions will take
 * priority in the event that both modify the same feature flag value.
 */
export const mockFeatureFlagRequests = () => {
  const featureFlagOverrides = Cypress.env('featureFlagOverrides');

  if (featureFlagOverrides) {
    beforeEach(() => {
      cy.intercept(
        {
          middleware: true,
          url: launchDarklyUrlPattern,
        },
        (req) => {
          req.on('before:response', (res) => {
            const overriddenFeatureFlagData = {
              ...res.body,
              ...featureFlagOverrides,
            };
            res.body = overriddenFeatureFlagData;
          });
        }
      );
    });
  }
};
