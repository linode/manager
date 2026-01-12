import { Box, Button, ErrorState, Stack, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import * as React from 'react';

import { Skeleton } from 'src/components/Skeleton';

import { ProductCardData } from './CategorySection';
import { ProductSelectionCard } from './ProductSelectionCard';

export interface CategorySectionViewProps {
  cardData: ProductCardData[];
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
}) => (
  <Grid container spacing={2}>
    {Array.from({ length: productsDisplayedCount }).map((_, index) => (
      <Box key={index} sx={{ width: 400, height: 280 }}>
        <Skeleton
          animation="wave"
          height="100%"
          sx={{ borderRadius: 2 }}
          variant="rounded"
          width="100%"
        />
      </Box>
    ))}
  </Grid>
);

const ProductsGrid = ({
  cardData,
  onProductClick,
}: {
  cardData: ProductCardData[];
  onProductClick: (productId: number) => void;
}) => (
  <Grid container spacing={2}>
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
