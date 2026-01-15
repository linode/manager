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
  searchDerivedCategoryIds?: number[];
  searchDerivedPartnerIds?: number[];
  searchDerivedTypeIds?: number[];
  searchQuery: string;
  typeId?: number;
}

export interface CategorySectionProps {
  category: MarketplaceCategory;
  filters: GlobalFilters;
}

export interface ProductCardItem {
  data: ProductCardData;
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

  const apiFilter: Filter = {
    category_id: categoryId,
    ...(filters.searchQuery
      ? {
          '+or': [
            { name: { '+contains': filters.searchQuery } },
            { short_description: { '+contains': filters.searchQuery } },
            // Include search-derived IDs in the OR condition (excluding duplicates)
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

  return {
    products,
    displayCount,
    setDisplayCount,
    error,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  };
};

export const CategorySection = (props: CategorySectionProps) => {
  const { category, filters } = props;
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    products,
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
  React.useEffect(() => {
    const shouldFetchMore =
      !isFetchingNextPage &&
      products.length > 0 &&
      displayCount >= products.length &&
      products.length < category.products_count;

    if (shouldFetchMore) {
      fetchNextPage();
    }
  }, [
    isFetchingNextPage,
    products.length,
    displayCount,
    category.products_count,
    fetchNextPage,
  ]);

  const isLoading = isProductsLoading || isPartnerLoading || isTypesLoading;
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
    id: product.id,
    data: {
      companyName: partnersMap?.[product.partner_id]?.name || '',
      description: product.short_description,
      logoUrl: getLogoUrl(product.partner_id),
      productName: product.name,
      productTag: product.tile_tag,
      type: typesMap?.[product.type_id]?.name ?? '',
    },
  }));

  const errorMessage = productsError
    ? getAPIErrorOrDefault(
        productsError,
        `Error loading products for category ${category.name}`
      )[0].reason
    : '';

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
      productsError={!!productsError}
      skeletonCount={getSkeletonCount()}
    />
  );
};
