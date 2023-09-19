/**
 * @file Constants related to tiered pricing.
 */

import { linodeTypeFactory } from '@src/factories';

/** Notice shown to users when selecting a region. */
export const dcPricingRegionNotice = /Prices for plans, products, and services in .* may vary from other regions\./;

/** Notice shown to users when selecting a region with a different price structure. */
export const dcPricingRegionDifferenceNotice =
  'The selected region has a different price structure.';

/** Notice shown to users trying to choose a plan before selecting a region. */
export const dcPricingPlanPlaceholder =
  'Select a region to view plans and prices.';

/** DC-specific pricing docs link label. */
export const dcPricingDocsLabel = 'How Data Center Pricing Works';

/** DC-specific pricing docs link destination. */
export const dcPricingDocsUrl = 'https://www.linode.com/pricing';

/** DC-specific pricing Linode type mocks. */
export const dcPricingMockLinodeTypes = linodeTypeFactory.buildList(3, {
  region_prices: [
    {
      hourly: 0.021,
      // Use `us-east` and `us-west` so we do not have to mock regions request,
      // which otherwise may not include the actual regions which have DC-specific pricing applied.
      id: 'us-east',
      monthly: 14,
    },
    {
      hourly: 0.018,
      // Use `us-east` and `us-west` so we do not have to mock regions request,
      // which otherwise may not include the actual regions which have DC-specific pricing applied.
      id: 'us-west',
      monthly: 12,
    },
  ],
});
