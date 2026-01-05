import { useFlags } from 'src/hooks/useFlags';

/**
 * Returns whether or not features related to the Marketplace project
 * should be enabled.
 *
 * Note: Currently, this just uses the `marketplaceV2` feature flag as a source of truth,
 * but will eventually also look at account capabilities if available.
 */
export const useIsMarketplaceV2Enabled = () => {
  const flags = useFlags();

  if (!flags) {
    return {
      isMarketplaceFeatureEnabled: false,
    };
  }

  // @TODO: Cloud Manager Marketplace - check for customer tag/account capability when it exists
  return {
    isMarketplaceFeatureEnabled: flags.marketplaceV2,
  };
};
