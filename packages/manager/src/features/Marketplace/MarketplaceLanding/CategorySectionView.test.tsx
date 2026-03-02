import React from 'react';
import '@testing-library/jest-dom';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CategorySectionView } from './CategorySectionView';

describe('CategorySectionView', () => {
  const mockCardData = [
    {
      companyName: 'Akamai Technologies',
      description:
        'Akamai is a global content delivery network (CDN) and cloud service provider that offers solutions for web performance, security, and media delivery.',
      logoUrl: 'https://www.akamai.com/site/akamai-logo-v5.svg',
      productName: 'Akamai Compute',
      type: 'Saas & APIs',
      id: 'akamai-compute',
    },
  ];
  const mockProps = {
    cardData: mockCardData,
    categoryName: 'Test Category',
    displayCount: 1,
    errorMessage: '',
    hasMoreProducts: false,
    isLoading: false,
    onLoadMore: vi.fn(),
    onProductClick: vi.fn(),
  };

  it('renders Category name', () => {
    const { getByText } = renderWithTheme(
      <CategorySectionView {...mockProps} />
    );
    expect(getByText('Test Category')).toBeVisible();
  });

  it('displays the correct number of products', () => {
    const { getAllByTestId } = renderWithTheme(
      <CategorySectionView {...mockProps} />
    );
    const items = getAllByTestId('selection-card');
    expect(items).toHaveLength(mockProps.cardData.length);
  });

  it('renders the load more button if `hasMoreProducts` is true', () => {
    const propsWithMoreProducts = {
      ...mockProps,
      hasMoreProducts: true,
      isLoading: false,
    };

    const { getByRole } = renderWithTheme(
      <CategorySectionView {...propsWithMoreProducts} />
    );
    const loadMoreButton = getByRole('button', {
      name: /Load More.../i,
    });
    expect(loadMoreButton).toBeVisible();
  });

  it('does not render the load more button if `hasMoreProducts` is false or loading', () => {
    const propsWithoutMoreProducts = {
      ...mockProps,
      hasMoreProducts: false,
      isLoading: false,
    };
    const propsLoading = {
      ...mockProps,
      hasMoreProducts: true,
      isLoading: true,
    };

    const { queryByRole: queryByRoleNoMore } = renderWithTheme(
      <CategorySectionView {...propsWithoutMoreProducts} />
    );
    expect(queryByRoleNoMore('button', { name: /Load More.../i })).toBeNull();

    const { queryByRole: queryByRoleLoading } = renderWithTheme(
      <CategorySectionView {...propsLoading} />
    );
    expect(queryByRoleLoading('button', { name: /Load More.../i })).toBeNull();
  });

  it('renders the correct product details', () => {
    const { getByText } = renderWithTheme(
      <CategorySectionView {...mockProps} />
    );
    mockProps.cardData.forEach((item) => {
      expect(getByText(item.productName)).toBeVisible();
      expect(getByText(item.companyName)).toBeVisible();
      expect(getByText(item.description)).toBeVisible();
      expect(getByText(item.type)).toBeVisible();
    });
  });

  it('renders the product skeleton while loading', () => {
    const loadingProps = {
      ...mockProps,
      cardData: [],
      isLoading: true,
    };

    const { getAllByTestId } = renderWithTheme(
      <CategorySectionView {...loadingProps} />
    );
    const items = getAllByTestId('marketplace-skeleton-card');
    expect(items.length).toBeGreaterThan(0);
  });

  it('renders the error message when there is an error', () => {
    const errorProps = {
      ...mockProps,
      errorMessage: 'Failed to load products.',
    };
    const { getByText } = renderWithTheme(
      <CategorySectionView {...errorProps} />
    );
    expect(getByText('Failed to load products.')).toBeVisible();
  });
});
