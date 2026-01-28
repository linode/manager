import { useTheme } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { CategorySectionView } from './CategorySectionView';

import type { Category, Product } from './marketplace';
import type { ProductCardData } from './ProductSelectionCard';

export interface CategorySectionProps {
  categoryName: Category;
  products: Product[];
}

export interface ProductCardItem extends ProductCardData {
  id: number;
}

const PRODUCTS_PER_BATCH = 6;

export const CategorySection = (props: CategorySectionProps) => {
  const { categoryName, products } = props;
  const theme = useTheme();
  const navigate = useNavigate();

  const [displayCount, setDisplayCount] = React.useState(PRODUCTS_PER_BATCH);
  const productsToDisplay = products.slice(0, displayCount);
  const hasMoreProducts = products.length > displayCount;

  const getLogoUrl = (product: Product) => {
    return theme.name === 'light'
      ? `/assets/marketplace/${product.partner.logoLightMode}`
      : `/assets/white/marketplace/${product.partner.logoDarkMode}`;
  };

  const handleProductClick = (productId: number) => {
    navigate({ to: `/cloud-marketplace/catalog/${productId}` });
  };

  const cardData: ProductCardItem[] = productsToDisplay.map((product) => ({
    companyName: product.partner.name,
    description: product.shortDescription,
    id: product.id,
    logoUrl: getLogoUrl(product),
    productName: product.name,
    productTag: product.tileTag,
    type: product.type.name,
  }));

  return (
    <CategorySectionView
      cardData={cardData}
      categoryName={categoryName}
      displayCount={productsToDisplay.length}
      errorMessage={''}
      hasMoreProducts={hasMoreProducts}
      onLoadMore={() => setDisplayCount((prev) => prev + PRODUCTS_PER_BATCH)}
      onProductClick={handleProductClick}
    />
  );
};
