import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ProductSelectionCard } from './ProductSelectionCard';

describe('ProductSelectionCard', () => {
  const baseData = {
    companyName: 'Test Company',
    description: 'This is a test product description',
    logoUrl: '/test-logo.png',
    productName: 'Test Product',
    type: 'SaaS & APIs',
  };

  it('renders all - logo image, product name, company name, description and type chip', () => {
    const { getByAltText, getByText } = renderWithTheme(
      <ProductSelectionCard
        data={{
          ...baseData,
        }}
        onClick={() => {}}
      />
    );

    const logo = getByAltText('Test Product logo');
    expect(logo).toBeVisible();
    expect(logo).toHaveAttribute('src', '/test-logo.png');

    expect(getByText('Test Product')).toBeVisible();
    expect(getByText('Test Company')).toBeVisible();
    expect(getByText('This is a test product description')).toBeVisible();
    expect(getByText('SaaS & APIs')).toBeVisible();
  });

  it('truncates long descriptions and appends an ellipsis', () => {
    const longDescription = Array(300).fill('word').join(' ');
    const { getByText } = renderWithTheme(
      <ProductSelectionCard
        data={{
          ...baseData,
          description: longDescription,
        }}
        onClick={() => {}}
      />
    );

    const displayedText = getByText(/word/);
    // Truncate adds "..." so length should be less than original
    expect(displayedText.textContent?.length).toBeLessThan(
      longDescription.length
    );
    expect(displayedText.textContent).toContain('...');
  });

  it('renders product tag chip when provided', () => {
    const { getByText } = renderWithTheme(
      <ProductSelectionCard
        data={{
          ...baseData,
          productTag: 'New',
        }}
        onClick={() => {}}
      />
    );

    expect(getByText('New')).toBeVisible();
  });

  it('calls onClick when card is clicked', async () => {
    const handleClick = vi.fn();
    const { getByText } = renderWithTheme(
      <ProductSelectionCard data={{ ...baseData }} onClick={handleClick} />
    );

    await userEvent.click(getByText('Test Product'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled state correctly', () => {
    const { getByTestId } = renderWithTheme(
      <ProductSelectionCard
        data={{ ...baseData }}
        disabled
        onClick={() => {}}
      />
    );

    expect(getByTestId('selection-card')).toBeDisabled();
  });

  it('renders all elements together', () => {
    const { getByText, getByAltText } = renderWithTheme(
      <ProductSelectionCard
        data={{
          ...baseData,
          description: 'Full product description',
          logoUrl: '/logo.png',
          productName: 'Complete Product',
          productTag: 'New',
        }}
        onClick={() => {}}
      />
    );

    expect(getByText('Complete Product')).toBeVisible();
    expect(getByText('Test Company')).toBeVisible();
    expect(getByText('Full product description')).toBeVisible();
    expect(getByText('New')).toBeVisible();
    expect(getByText('SaaS & APIs')).toBeVisible();
    expect(getByAltText('Complete Product logo')).toBeVisible();
  });

  it('does not render optional elements when not provided', () => {
    const { getByText, queryByText } = renderWithTheme(
      <ProductSelectionCard
        data={{
          ...baseData,
          productName: 'Minimal Product',
        }}
        onClick={() => {}}
      />
    );

    expect(getByText('Minimal Product')).toBeVisible();
    expect(getByText('Test Company')).toBeVisible();
    expect(getByText('This is a test product description')).toBeVisible();
    expect(getByText('SaaS & APIs')).toBeVisible();

    // optional elements should not be in the document
    expect(queryByText('New')).not.toBeInTheDocument();
  });
});
