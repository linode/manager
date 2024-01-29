import type { AccountCapability } from '@linode/api-v4';

/**
 * Determines if a feature should be enabled.
 *
 * @returns true if the feature is returned from account.capabilities **or** if it is explicitly enabled
 * by a feature flag
 *
 * We use "or" instead of "and" here to allow us to enable features in "lower" environments
 * without needing the customer capability.
 *
 * If you need to launch a production feature, but have it be gated,
 * you would turn the flag *off* for that environment, but have the API return
 * the account capability.
 */
export const isFeatureEnabled = (
  featureName: AccountCapability,
  isFeatureFlagEnabled: boolean,
  capabilities: AccountCapability[]
) => {
  return isFeatureFlagEnabled || capabilities.includes(featureName);
};
