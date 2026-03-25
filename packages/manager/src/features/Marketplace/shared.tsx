import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import type { SxProps, Theme } from '@mui/material/styles';

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
  id: string;
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

/**
 * Formats trademark symbols (e.g. ®) in a string as superscript.
 * Returns the original string unchanged if no trademark symbols are found.
 * When symbols are present, returns a <span> wrapping the text with
 * styled <sup> elements. Using a single wrapper ensures the result
 * behaves as one inline/flex child and avoids layout misalignment
 * in flex containers like card headings.
 */
export const formatTrademarkSymbols = (
  text: string
): React.ReactElement | string => {
  if (!text.includes('\u00AE')) {
    return text;
  }

  const parts = text.split('\u00AE');

  return (
    <span>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <sup style={{ fontSize: '0.55em', lineHeight: 1 }}>{'\u00AE'}</sup>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};

export const getLogoUrl = (product: Product, theme: Theme) => {
  const base = '/assets/marketplace/';
  return theme.name === 'light'
    ? `${base}${product.partner.logoLightMode}`
    : `${base}${product.partner.logoDarkMode}`;
};

/**
 * Common container styles for Marketplace pages (Landing and Product Details)
 */
export const marketplaceContainerStyles: SxProps<Theme> = (theme) => ({
  mx: {
    md: 0,
    sm: theme.spacingFunction(16), // tablet
    xs: theme.spacingFunction(12), // mobile
  },
  // Adjust Breadcrumb's marginLeft on screens < md to keep it aligned with the content
  '& [data-qa-entity-header]': {
    [theme.breakpoints.down('md')]: {
      marginLeft: `-${theme.spacingFunction(8)}`,
    },
  },
});
