import { useFlags } from 'src/hooks/useFlags';

import type { Theme } from '@mui/material/styles';

export type Category =
  | 'AI'
  | 'CDN Affiliated'
  | 'Compute'
  | 'Data Analytics'
  | 'Database Management'
  | 'Data Sources'
  | 'Development Tools'
  | 'Enterprise'
  | 'Kubernetes'
  | 'Media & Entertainment, Gaming'
  | 'Networking'
  | 'Other Software and APIs'
  | 'Storage';

export type Type =
  | 'Agentic Systems'
  | 'Data Service'
  | 'Kubernetes'
  | 'SaaS & APIs'
  | 'Virtual Machines';

export interface Product {
  categories: Category[];
  id: number;
  infoBanner?: string;
  name: string;
  partner: {
    email?: string;
    logoDarkMode: string;
    logoLightMode: string;
    name: string;
    url: string;
  };
  productTags?: string[];
  shortDescription: string;
  tileTag?: string;
  type: {
    name: Type;
  };
}

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
      isMarketplaceV2FeatureEnabled: false,
    };
  }

  // @TODO: Cloud Manager Marketplace - check for customer tag/account capability when it exists
  return {
    isMarketplaceV2FeatureEnabled: flags.marketplaceV2,
  };
};

export const getLogoUrl = (product: Product, theme: Theme) => {
  return theme.name === 'light'
    ? `/assets/marketplace/${product.partner.logoLightMode}`
    : `/assets/marketplace/white/${product.partner.logoDarkMode}`;
};
