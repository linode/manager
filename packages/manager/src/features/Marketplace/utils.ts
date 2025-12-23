import { useFlags } from 'src/hooks/useFlags';

/**
 * Returns whether or not features related to the Marketplace project
 * should be enabled, and whether they are in beta, LA, or GA.
 *
 * Note: Currently, this just uses the `Marketplace` feature flag as a source of truth,
 * but will eventually also look at account capabilities if available.
 */
export const useIsMarketplaceEnabled = () => {
  const flags = useFlags();

  if (!flags) {
    return {
      isMarketplaceFeatureEnabled: false,
      isMarketplaceBetaEnabled: false,
      isMarketplaceLAEnabled: false,
      isMarketplaceGAEnabled: false,
    };
  }

  // @TODO: Cloud Manager Marketplace - check for customer tag/account capability when it exists
  return {
    isMarketplaceFeatureEnabled: flags.marketplace?.enabled,
    isMarketplaceBetaEnabled: flags.marketplace?.beta,
    isMarketplaceLAEnabled: flags.marketplace?.la,
    isMarketplaceGAEnabled: flags.marketplace?.ga,
  };
};
