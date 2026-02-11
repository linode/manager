import { Button, ErrorState, Stack, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import * as React from 'react';

import { ProductSelectionCard } from './ProductSelectionCard';
import { ProductSelectionCardSkeleton } from './ProductSelectionCardSkeleton';

import type { ProductCardItem } from './CategorySection';

export interface CategorySectionViewProps {
  cardData: ProductCardItem[];
  categoryName: string;
  displayCount: number;
  errorMessage: string;
  hasMoreProducts: boolean;
  isLoading?: boolean;
  onLoadMore: () => void;
  onProductClick: (productId: string) => void;
}

const SkeletonGrid = ({ count }: { count: number }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <ProductSelectionCardSkeleton key={`skeleton-${index}`} />
    ))}
  </Grid>
);

const ProductsGrid = ({
  cardData,
  onProductClick,
}: {
  cardData: ProductCardItem[];
  onProductClick: (productId: string) => void;
}) => (
  <Grid container spacing={3}>
    {cardData.map((item) => {
      const { id, ...data } = item;
      return (
        <ProductSelectionCard
          data={data}
          key={id}
          onClick={() => onProductClick(id)}
        />
      );
    })}
  </Grid>
);

export const CategorySectionView = (props: CategorySectionViewProps) => {
  const {
    categoryName,
    isLoading,
    hasMoreProducts,
    displayCount,
    cardData,
    errorMessage,
    onLoadMore,
    onProductClick,
  } = props;

  if (errorMessage) {
    return <ErrorState errorText={errorMessage} />;
  }

  return (
    <Stack data-qa-product-category={categoryName} spacing={2}>
      <Typography variant="h2">{categoryName}</Typography>

      {isLoading ? (
        <SkeletonGrid count={displayCount} />
      ) : (
        <ProductsGrid cardData={cardData} onProductClick={onProductClick} />
      )}

      {hasMoreProducts && !isLoading && (
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
