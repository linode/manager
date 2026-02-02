import { useTheme } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { getLogoUrl } from '../shared';
import { CategorySectionView } from './CategorySectionView';

import type { Category, Product } from '../shared';
import type { ProductCardData } from './ProductSelectionCard';

export interface CategorySectionProps {
  /**
   * The unique name of the category this section represents.
   */
  categoryName: Category;
  /**
   * The list of products belonging to this category.
   */
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

  const handleProductClick = (productId: number) => {
    navigate({ to: `/cloud-marketplace/catalog/${productId}` });
  };

  const cardData: ProductCardItem[] = productsToDisplay.map((product) => ({
    companyName: product.partner.name,
    description: product.shortDescription,
    id: product.id,
    logoUrl: getLogoUrl(product, theme),
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
