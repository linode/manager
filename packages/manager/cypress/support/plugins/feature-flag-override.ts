import type { CypressPlugin } from './plugin';

/**
 * Handles setup related to Launch Darkly feature flag overrides.
 *
 * Checks if the user has passed overrides via the `CY_TEST_FEATURE_FLAGS` env,
 * and validates its value if so by attempting to parse it as JSON. If that
 * succeeds, the parsed override object is exposed to Cypress via the
 * `featureFlagOverrides` config.
 */
export const featureFlagOverrides: CypressPlugin = (_on, config) => {
  const featureFlagOverridesJson = config.env?.['CY_TEST_FEATURE_FLAGS'];

  let featureFlagOverrides = undefined;
  if (featureFlagOverridesJson) {
    const notice =
      'Feature flag overrides are enabled with the following JSON payload:';
    const jsonWarning =
      'Be aware that malformed or invalid feature flag data can trigger crashes and other unexpected behavior.';

    console.info(`${notice}\n\n${featureFlagOverridesJson}\n\n${jsonWarning}`);

    try {
      featureFlagOverrides = JSON.parse(featureFlagOverridesJson);
    } catch (e) {
      throw new Error(
        `Unable to parse feature flag JSON:\n\n${featureFlagOverridesJson}\n\nPlease double check your 'CY_TEST_FEATURE_FLAGS' value and try again.`
      );
    }
  }

  return {
    ...config,
    env: {
      ...config.env,
      featureFlagOverrides,
    },
  };
};
