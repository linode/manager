import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ProductSelectionCard } from './ProductSelectionCard';

describe('ProductSelectionCard', () => {
  it('renders product name', () => {
    const { getByText } = renderWithTheme(
      <ProductSelectionCard
        logoUrl=""
        onClick={() => {}}
        productName="Test Product"
      />
    );

    expect(getByText('Test Product')).toBeVisible();
  });

  it('renders company name when provided', () => {
    const { getByText } = renderWithTheme(
      <ProductSelectionCard
        companyName="Test Company"
        logoUrl=""
        onClick={() => {}}
        productName="Test Product"
      />
    );

    expect(getByText('Test Company')).toBeVisible();
  });

  it('renders description when provided', () => {
    const { getByText } = renderWithTheme(
      <ProductSelectionCard
        description="This is a test product description"
        logoUrl=""
        onClick={() => {}}
        productName="Test Product"
      />
    );

    expect(getByText('This is a test product description')).toBeVisible();
  });

  it('truncates long descriptions and appends an ellipsis', () => {
    const longDescription = Array(300).fill('word').join(' ');
    const { getByText } = renderWithTheme(
      <ProductSelectionCard
        description={longDescription}
        logoUrl=""
        onClick={() => {}}
        productName="Test Product"
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
        logoUrl=""
        onClick={() => {}}
        productName="Test Product"
        productTag="New"
      />
    );

    expect(getByText('New')).toBeVisible();
  });

  it('renders type chip when provided', () => {
    const { getByText } = renderWithTheme(
      <ProductSelectionCard
        logoUrl=""
        onClick={() => {}}
        productName="Test Product"
        type="SaaS & APIs"
      />
    );

    expect(getByText('SaaS & APIs')).toBeVisible();
  });

  it('renders logo image when logoUrl is provided', () => {
    const { getByAltText } = renderWithTheme(
      <ProductSelectionCard
        logoUrl="/test-logo.png"
        onClick={() => {}}
        productName="Test Product"
      />
    );

    const logo = getByAltText('Test Product logo');
    expect(logo).toBeVisible();
    expect(logo).toHaveAttribute('src', '/test-logo.png');
  });

  it('calls onClick when card is clicked', async () => {
    const handleClick = vi.fn();
    const { getByText } = renderWithTheme(
      <ProductSelectionCard
        logoUrl=""
        onClick={handleClick}
        productName="Test Product"
      />
    );

    await userEvent.click(getByText('Test Product'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled state correctly', () => {
    const { getByTestId } = renderWithTheme(
      <ProductSelectionCard
        disabled
        logoUrl=""
        onClick={() => {}}
        productName="Test Product"
      />
    );

    expect(getByTestId('selection-card')).toBeDisabled();
  });

  it('renders all elements together', () => {
    const { getByText, getByAltText } = renderWithTheme(
      <ProductSelectionCard
        companyName="Test Company"
        description="Full product description"
        logoUrl="/logo.png"
        onClick={() => {}}
        productName="Complete Product"
        productTag="New"
        type="SaaS and APIs"
      />
    );

    expect(getByText('Complete Product')).toBeVisible();
    expect(getByText('Test Company')).toBeVisible();
    expect(getByText('Full product description')).toBeVisible();
    expect(getByText('New')).toBeVisible();
    expect(getByText('SaaS and APIs')).toBeVisible();
    expect(getByAltText('Complete Product logo')).toBeVisible();
  });

  it('does not render optional elements when not provided', () => {
    const { getByText, queryByText } = renderWithTheme(
      <ProductSelectionCard
        logoUrl=""
        onClick={() => {}}
        productName="Minimal Product"
      />
    );

    expect(getByText('Minimal Product')).toBeVisible();
    // optional elements should not be in the document
    expect(queryByText('Test Company')).not.toBeInTheDocument();
    expect(queryByText('New')).not.toBeInTheDocument();
    expect(queryByText('SaaS and APIs')).not.toBeInTheDocument();
  });
});
