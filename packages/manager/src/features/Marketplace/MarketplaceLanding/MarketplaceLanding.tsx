import { useAllMarketplaceCategoriesQuery } from '@linode/queries';
import { BetaChip, CircleProgress, ErrorState, Stack } from '@linode/ui';
import {
  marketplaceCategoryFactory,
  marketplaceProductFactory,
} from '@linode/utilities';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { CategorySection } from './CategorySection';

export const MarketplaceLanding = () => {
  const {
    data: categoriesData,
    error,
    isLoading,
  } = useAllMarketplaceCategoriesQuery({}, {}, true);

  const filteredProducts = marketplaceProductFactory.buildList(5);

  const categories = categoriesData || marketplaceCategoryFactory.buildList(5);

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
