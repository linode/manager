/**
 * @file Constants related to tiered pricing.
 */

import { linodeTypeFactory } from '@src/factories';

/** Notice shown to users when selecting a region. */
export const tieredPricingRegionNotice =
  'Prices for plans, products, and services may vary based on Region.';

/** Notice shown to users when selecting a region with a different price structure. */
export const tieredPricingRegionDifferenceNotice =
  'The selected region has a different price structure.';

/** Notice shown to users trying to choose a plan before selecting a region. */
export const tieredPricingPlanPlaceholder =
  'Select a region to view plans and prices.';

/** Tiered pricing docs link label. */
export const tieredPricingDocsLabel = 'How Data Center Pricing Works';

/** Tiered pricing docs link destination. */
export const tieredPricingDocsUrl = 'https://www.linode.com/pricing';

/** Tiered pricing Linode type mocks, with regional prices for 'us-east' and 'us-west'. */
export const tieredPricingMockLinodeTypes = linodeTypeFactory.buildList(3, {
  region_prices: [
    {
      hourly: 0.021,
      id: 'us-east',
      monthly: 14,
    },
    {
      hourly: 0.018,
      id: 'us-west',
      monthly: 12,
    },
  ],
});
