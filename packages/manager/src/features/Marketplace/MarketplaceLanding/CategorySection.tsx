import {
  MarketplaceCategory,
  MarketplaceProduct,
  MarketplaceType,
} from '@linode/api-v4';
import {
  useAllMarketplacePartnersQuery,
  useAllMarketplaceTypesQuery,
  useInfiniteMarketplaceProductsQuery,
} from '@linode/queries';
import { useTheme } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { CategorySectionView } from './CategorySectionView';

const INITIAL_DISPLAY_COUNT = 6;
const LOAD_MORE_INCREMENT = 6;
const PAGE_SIZE = 30;

export interface CategorySectionProps extends MarketplaceCategory {
  filteredProducts?: MarketplaceProduct[];
}

export interface ProductCardData {
  data: {
    companyName: string;
    description: string;
    logoUrl: string;
    productName: string;
    productTag?: string;
    type: string;
  };
  id: number;
}

const useTypesMap = () => {
  const { data: types, isLoading, error } = useAllMarketplaceTypesQuery();

  return React.useMemo(() => {
    if (isLoading || error || !types) {
      return { typesMap: undefined, isLoading, error };
    }

    const map: Record<number, MarketplaceType> = {};
    types.forEach((type) => {
      map[type.id] = type;
    });

    return { typesMap: map, isLoading, error };
  }, [types, isLoading, error]);
};

const useProductsDisplay = (
  categoryId: number,
  products_count: number,
  filteredProducts?: MarketplaceProduct[]
) => {
  const [displayCount, setDisplayCount] = React.useState(
    Math.min(products_count, INITIAL_DISPLAY_COUNT)
  );

  const {
    data: productsData,
    error,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteMarketplaceProductsQuery(
    { category: categoryId, pageSize: PAGE_SIZE },
    !filteredProducts
  );

  const products = React.useMemo(
    () =>
      productsData?.pages.flatMap((page) => page.data) ??
      filteredProducts ??
      [],
    [productsData, filteredProducts]
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
  const { name, id, products_count, filteredProducts } = props;
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
  } = useProductsDisplay(id, products_count, filteredProducts);

  const { data: partnersMap, isLoading: isPartnerLoading } =
    useAllMarketplacePartnersQuery();

  const { typesMap, isLoading: isTypesLoading } = useTypesMap();

  React.useEffect(() => {
    const shouldFetchMore =
      !filteredProducts &&
      !isFetchingNextPage &&
      products.length > 0 &&
      displayCount >= products.length &&
      products.length < products_count;

    if (shouldFetchMore) {
      fetchNextPage();
    }
  }, [
    filteredProducts,
    isFetchingNextPage,
    products.length,
    displayCount,
    products_count,
    fetchNextPage,
  ]);

  const isLoading = isProductsLoading || isPartnerLoading || isTypesLoading;
  const productsToDisplay = products.slice(0, displayCount);
  const hasMoreProducts = products_count > displayCount;

  const getLogoUrl = (partnerId: number) => {
    const partner = partnersMap?.[partnerId];
    if (!partner) return '';

    return theme.name === 'light'
      ? partner.logo_url_light_mode
      : partner.logo_url_dark_mode;
  };

  const getSkeletonCount = () => {
    const remaining = products_count - displayCount;
    return Math.min(remaining, LOAD_MORE_INCREMENT);
  };

  const handleLoadMore = () => {
    const remaining = products_count - displayCount;
    const increment = Math.min(remaining, LOAD_MORE_INCREMENT);
    setDisplayCount(displayCount + increment);
  };

  const handleProductClick = (productId: number) => {
    navigate({ to: `/cloud-marketplace/catalog/${productId}` });
  };

  const cardData: ProductCardData[] = productsToDisplay.map((product) => ({
    id: product.id,
    data: {
      companyName: partnersMap?.[product.partner_id]?.name || '',
      description: product.short_description,
      logoUrl: getLogoUrl(product.partner_id),
      productName: product.name,
      productTag: product.tile_tag,
      type: typesMap?.[product.type_id]?.name ?? 'Application',
    },
  }));

  const errorMessage = productsError
    ? getAPIErrorOrDefault(
        productsError,
        `Error loading products for category ${name}`
      )[0].reason
    : '';

  return (
    <CategorySectionView
      cardData={cardData}
      categoryName={name || 'Category 1'}
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
