import { useAllMarketplaceCategoriesQuery } from '@linode/queries';
import { BetaChip, Box, CircleProgress, ErrorState, Stack } from '@linode/ui';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { CategorySection } from './CategorySection';

export const MarketplaceLanding = () => {
  const {
    data: categories,
    error,
    isLoading,
  } = useAllMarketplaceCategoriesQuery({}, {}, true);

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

  // @TODO: globalFilters will be populated in a follow-up PR from the search input and dropdown selections
  const globalFilters = {};

  return (
    <Box
      sx={(theme) => ({
        px: {
          sm: theme.spacingFunction(16),
          xs: theme.spacingFunction(12),
        },
        // Adjust Breadcrumb's marginLeft on screens < md to keep it aligned with the Products
        '& [data-qa-entity-header]': {
          [theme.breakpoints.down('md')]: {
            marginLeft: `-${theme.spacingFunction(8)}`,
          },
        },
      })}
    >
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: (
                <>
                  Partner Referrals
                  <BetaChip component="span" />
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
      <Stack spacing={4}>
        {categories?.map(
          (category) =>
            category.products_count > 0 && (
              <CategorySection
                category={category}
                filters={globalFilters}
                key={category.id}
              />
            )
        )}
      </Stack>
    </Box>
  );
};
