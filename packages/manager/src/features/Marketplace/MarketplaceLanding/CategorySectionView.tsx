import { Box, Button, ErrorState, Stack, Typography } from '@linode/ui';
import { Grid, styled } from '@mui/material';
import * as React from 'react';

import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Skeleton } from 'src/components/Skeleton';

import { ProductSelectionCard, StyledLogoBox } from './ProductSelectionCard';

import type { ProductCardItem } from './CategorySection';

export interface CategorySectionViewProps {
  cardData: ProductCardItem[];
  categoryName: string;
  displayCount: number;
  errorMessage: string;
  hasMoreProducts: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onProductClick: (productId: number) => void;
  productsError: boolean;
  skeletonCount: number;
}

const MarketplaceSkeletonGrid = ({
  productsDisplayedCount = 6,
}: {
  productsDisplayedCount?: number;
}) => {
  const renderIcon = React.useCallback(
    () => (
      <Box
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        {
          <StyledLogoBox>
            <Skeleton height="48px" variant="rounded" width="48px" />
          </StyledLogoBox>
        }
      </Box>
    ),
    [productsDisplayedCount]
  );

  const heading = React.useMemo(
    () => <StyledSkeleton width="60%" />,
    [productsDisplayedCount]
  );

  const subHeadings = React.useMemo(
    () => [
      <StyledSkeleton key="company" width="40%" />,
      <Box
        key="description"
        sx={(theme) => ({
          marginTop: theme.spacingFunction(12),
          paddingBottom: theme.spacingFunction(36), // Always space for type chip at bottom
        })}
      >
        <StyledSkeleton />
        <StyledSkeleton />
        <StyledSkeleton width="50%" />
      </Box>,
      <Box
        key="category"
        sx={(theme) => ({
          bottom: theme.spacingFunction(16),
          left: theme.spacingFunction(20),
          position: 'absolute',
        })}
      >
        <StyledSkeleton height={20} width={80} />
      </Box>,
    ],
    [productsDisplayedCount]
  );
  return (
    <Grid container spacing={2}>
      {Array.from({ length: productsDisplayedCount }).map((_, index) => (
        <SelectionCard
          gridSize={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}
          heading={heading}
          key={`skeleton-${index}`}
          renderIcon={renderIcon}
          subheadings={subHeadings}
          sxCardBase={(theme) => ({
            alignItems: 'flex-start',
            flexDirection: 'column',
            minHeight: '280px',
            padding: `${theme.spacingFunction(16)} ${theme.spacingFunction(20)}`,
            position: 'relative',
            gap: theme.spacingFunction(12),
            '&:hover': {
              borderColor: theme.borderColors.divider,
              backgroundColor: theme.tokens.alias.Background.Normal,
              boxShadow: theme.tokens.alias.Elevation.S,
            },
            backgroundColor: theme.tokens.alias.Background.Normal,
          })}
          sxCardBaseHeading={{ width: '100%' }}
          sxCardBaseIcon={{
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            width: '100%',
          }}
        />
      ))}
    </Grid>
  );
};

const ProductsGrid = ({
  cardData,
  onProductClick,
}: {
  cardData: ProductCardItem[];
  onProductClick: (productId: number) => void;
}) => (
  <Grid container spacing={3}>
    {cardData.map((item) => (
      <ProductSelectionCard
        data={item.data}
        key={item.id}
        onClick={() => onProductClick(item.id)}
      />
    ))}
  </Grid>
);

export const CategorySectionView = (props: CategorySectionViewProps) => {
  const {
    categoryName,
    isLoading,
    isFetchingNextPage,
    hasMoreProducts,
    productsError,
    displayCount,
    cardData,
    skeletonCount,
    errorMessage,
    onLoadMore,
    onProductClick,
  } = props;

  if (productsError) {
    return <ErrorState errorText={errorMessage} />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h2">{categoryName}</Typography>

      {isLoading ? (
        <MarketplaceSkeletonGrid productsDisplayedCount={displayCount} />
      ) : (
        <ProductsGrid cardData={cardData} onProductClick={onProductClick} />
      )}

      {isFetchingNextPage && (
        <MarketplaceSkeletonGrid productsDisplayedCount={skeletonCount} />
      )}

      {!isFetchingNextPage && hasMoreProducts && (
        <Button
          onClick={onLoadMore}
          sx={{
            justifyContent: 'start',
            paddingLeft: 0,
          }}
        >
          Load More...
        </Button>
      )}
    </Stack>
  );
};

const StyledSkeleton = styled(Skeleton)({
  borderRadius: '4px',
});
