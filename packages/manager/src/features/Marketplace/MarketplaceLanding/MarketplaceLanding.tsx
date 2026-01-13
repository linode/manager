import { useAllMarketplaceCategoriesQuery } from '@linode/queries';
import { BetaChip, CircleProgress, ErrorState, Stack } from '@linode/ui';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { CategorySection } from './CategorySection';

import type { MarketplaceProduct } from '@linode/api-v4';

export const MarketplaceLanding = () => {
  const {
    data: categories,
    error,
    isLoading,
  } = useAllMarketplaceCategoriesQuery({}, {}, true);

  const filteredProducts: MarketplaceProduct[] = [];

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading Marketplace.')[0].reason
        }
      />
    );
  }

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: (
                <>
                  Partner Referrals
                  <BetaChip />
                </>
              ),
              position: 1,
            },
            {
              label: 'Catalog',
              position: 2,
            },
          ],
          pathname: '/cloud-marketplace/catalog',
        }}
      />
      <Stack spacing={3}>
        {categories?.map(
          (category) =>
            category.products_count > 0 && (
              <CategorySection
                key={category.id}
                {...category}
                filteredProducts={filteredProducts}
              />
            )
        )}
      </Stack>
    </>
  );
};
