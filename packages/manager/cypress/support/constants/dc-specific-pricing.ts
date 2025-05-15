/**
 * @file Constants related to DC-specific pricing.
 */

import { linodeTypeFactory } from '@linode/utilities';

import type { LkePlanDescription } from 'support/api/lke';

/** Notice shown to users when selecting a region with a different price structure. */
export const dcPricingRegionDifferenceNotice =
  'The selected region has a different price structure.';

/** Notice shown to users trying to choose a plan before selecting a region. */
export const dcPricingPlanPlaceholder =
  'Select a region to view plans and prices.';

/** Helper text shown to users users trying to create an LKE cluster before selecting both a region and plan. */
export const dcPricingLkeCheckoutSummaryPlaceholder =
  'Select a region, HA choice, and add a Node Pool to view pricing and create a cluster.';

export const dcPricingLkeHAPlaceholder =
  'Select a region to view price information.';

/** DC-specific pricing docs link label. */
export const dcPricingDocsLabel = 'How Data Center Pricing Works';

/** DC-specific pricing docs link destination. */
export const dcPricingDocsUrl = 'https://www.linode.com/pricing';

/** DC-specific pricing current price label. */
export const dcPricingCurrentPriceLabel = 'Current Price';

/** DC-specific pricing new price label. */
export const dcPricingNewPriceLabel = 'New Price';

/** DC-specific pricing Linode type mocks. */
export const dcPricingMockLinodeTypes = linodeTypeFactory.buildList(3, {
  addons: {
    backups: {
      price: {
        hourly: 0.004,
        monthly: 2.0,
      },
      region_prices: [
        {
          hourly: 0.0048,
          id: 'us-east',
          monthly: 3.57,
        },
        {
          hourly: 0.0056,
          id: 'us-west',
          monthly: 4.17,
        },
        {
          hourly: 0.006,
          id: 'us-southeast',
          monthly: 4.67,
        },
      ],
    },
  },
  region_prices: [
    {
      hourly: 0.021,
      // Use `us-east` and `us-west` so we do not have to mock regions request,
      // which otherwise may not include the actual regions which have DC-specific pricing applied.
      id: 'us-east',
      monthly: 14.4,
    },
    {
      hourly: 0.018,
      // Use `us-east` and `us-west` so we do not have to mock regions request,
      // which otherwise may not include the actual regions which have DC-specific pricing applied.
      id: 'us-west',
      monthly: 12.2,
    },
    {
      // Mock a DC with $0 region prices, which is possible in some circumstances (e.g. Limited Availability).
      hourly: 0.0,
      id: 'us-southeast',
      monthly: 0.0,
    },
  ],
});

export const dcPricingMockLinodeTypesForBackups = linodeTypeFactory.buildList(
  3,
  {
    addons: {
      backups: {
        price: {
          hourly: 0.004,
          monthly: 2.0,
        },
        region_prices: [
          {
            hourly: 0,
            id: 'us-ord',
            monthly: 0,
          },
          {
            hourly: 0.0048,
            id: 'us-east',
            monthly: 3.57,
          },
          {
            hourly: 0.0056,
            id: 'us-west',
            monthly: 4.17,
          },
          {
            hourly: 0.006,
            id: 'us-southeast',
            monthly: 4.67,
          },
        ],
      },
    },
    id: 'g6-nanode-1',
  }
);

/**
 * Subset of LKE cluster plans as shown on Cloud Manager, mapped from DC-specific pricing mock linode
 * types to ensure size is consistent with ids in the types factory.
 */
export const dcPricingLkeClusterPlans: LkePlanDescription[] =
  dcPricingMockLinodeTypes.map((type) => {
    return {
      nodeCount: 1,
      planName: 'Linode 2 GB',
      size: parseInt(type.id.split('-')[2], 10),
      tab: 'Shared CPU',
      type: 'nanode',
    };
  });

export const MAGIC_DATE_THAT_DC_SPECIFIC_PRICING_WAS_IMPLEMENTED =
  '2023-10-05 00:00:00Z';
