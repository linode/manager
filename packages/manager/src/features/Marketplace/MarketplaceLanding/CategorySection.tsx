import {
  useAllMarketplacePartnersMapQuery,
  useAllMarketplaceTypesMapQuery,
  useInfiniteMarketplaceProductsQuery,
} from '@linode/queries';
import { useTheme } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { useIsMarketplaceV2Enabled } from '../utils';
import { CategorySectionView } from './CategorySectionView';

import type { ProductCardData } from './ProductSelectionCard';
import type { Filter, MarketplaceCategory } from '@linode/api-v4';

const INITIAL_DISPLAY_COUNT = 6;
const LOAD_MORE_INCREMENT = 6;

export interface GlobalFilters {
  categoryId?: number;
  // IDs derived from search query matching category/type/partner names
  searchDerivedPartnerIds?: number[];
  searchDerivedTypeIds?: number[];
  searchQuery?: string;
  typeId?: number;
}

export interface CategorySectionProps {
  category: MarketplaceCategory;
  filters: GlobalFilters;
  onLoaded?: (isEmpty: boolean) => void;
}

export interface ProductCardItem extends ProductCardData {
  id: number;
}

const useProductsDisplay = (
  categoryId: number,
  productsCount: number,
  filters: GlobalFilters
) => {
  const [displayCount, setDisplayCount] = React.useState(
    Math.min(productsCount, INITIAL_DISPLAY_COUNT)
  );

  const { isMarketplaceV2FeatureEnabled } = useIsMarketplaceV2Enabled();

  // Always include category_id in the API filter
  const apiFilter: Filter = {
    category_id: categoryId,
    ...(filters.searchQuery
      ? {
          '+or': [
            { name: { '+contains': filters.searchQuery } },
            { short_description: { '+contains': filters.searchQuery } },
            // Include search-derived IDs in the OR condition
            ...(filters.searchDerivedTypeIds?.map((id) => ({ type_id: id })) ??
              []),
            ...(filters.searchDerivedPartnerIds?.map((id) => ({
              partner_id: id,
            })) ?? []),
          ],
        }
      : {}),
    ...(filters.typeId ? { type_id: filters.typeId } : {}),
  };

  const {
    data: productsData,
    error,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteMarketplaceProductsQuery(
    apiFilter,
    isMarketplaceV2FeatureEnabled ?? false
  );

  const products = React.useMemo(
    () => productsData?.pages.flatMap((page) => page.data) ?? [],
    [productsData]
  );

  // Track total products fetched from API
  const totalFetchedProducts = products.length;

  return {
    products,
    totalFetchedProducts,
    displayCount,
    setDisplayCount,
    error,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  };
};

export const CategorySection = (props: CategorySectionProps) => {
  const { category, filters, onLoaded } = props;
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    products,
    totalFetchedProducts,
    displayCount,
    setDisplayCount,
    error: productsError,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isProductsLoading,
  } = useProductsDisplay(category.id, category.products_count, filters);

  const { data: partnersMap, isLoading: isPartnerLoading } =
    useAllMarketplacePartnersMapQuery();

  const { data: typesMap, isLoading: isTypesLoading } =
    useAllMarketplaceTypesMapQuery();

  const isLoading = isProductsLoading || isPartnerLoading || isTypesLoading;

  // Notify parent when loading completes
  React.useEffect(() => {
    if (!isLoading && onLoaded) {
      onLoaded(products.length === 0);
    }
  }, [isLoading, products.length]);

  React.useEffect(() => {
    // Fetch next page when we've displayed all current products
    const shouldFetchMore =
      !isFetchingNextPage &&
      totalFetchedProducts > 0 &&
      displayCount >= totalFetchedProducts &&
      totalFetchedProducts < category.products_count;

    if (shouldFetchMore) {
      fetchNextPage();
    }
  }, [
    isFetchingNextPage,
    totalFetchedProducts,
    displayCount,
    category.products_count,
    fetchNextPage,
  ]);

  const productsToDisplay = products.slice(0, displayCount);
  const hasMoreProducts = category.products_count > displayCount;

  const getLogoUrl = (partnerId: number) => {
    const partner = partnersMap?.[partnerId];
    if (!partner) return '';

    return theme.name === 'light'
      ? partner.logo_url_light_mode
      : partner.logo_url_dark_mode;
  };

  const getSkeletonCount = () => {
    const remaining = category.products_count - displayCount;
    return Math.min(remaining, LOAD_MORE_INCREMENT);
  };

  const handleLoadMore = () => {
    const remaining = category.products_count - displayCount;
    const increment = Math.min(remaining, LOAD_MORE_INCREMENT);
    setDisplayCount(displayCount + increment);
  };

  const handleProductClick = (productId: number) => {
    navigate({ to: `/cloud-marketplace/catalog/${productId}` });
  };

  const cardData: ProductCardItem[] = productsToDisplay.map((product) => ({
    companyName: partnersMap?.[product.partner_id]?.name ?? '',
    description: product.short_description,
    id: product.id,
    logoUrl: getLogoUrl(product.partner_id),
    productName: product.name,
    productTag: product.tile_tag,
    type: typesMap?.[product.type_id]?.name ?? '',
  }));

  const errorMessage = productsError
    ? getAPIErrorOrDefault(
        productsError,
        `Error loading products for category ${category.name}`
      )[0].reason
    : '';

  // Don't render if no products after filtering (e.g., search results don't match this category)
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <CategorySectionView
      cardData={cardData}
      categoryName={category.name}
      displayCount={displayCount}
      errorMessage={errorMessage}
      hasMoreProducts={hasMoreProducts}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
      onLoadMore={handleLoadMore}
      onProductClick={handleProductClick}
      skeletonCount={getSkeletonCount()}
    />
  );
};
