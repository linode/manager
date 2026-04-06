import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { PaginationFooter } from './PaginationFooter';
import { PAGE_SIZES } from './PaginationFooter.constants';
import { getMinimumPageSizeForNumberOfItems } from './PaginationFooter.utils';

describe('getMinimumPageSizeForNumberOfItems', () => {
  it('should return the minimum page size needed to display a given number of items', () => {
    expect(getMinimumPageSizeForNumberOfItems(24, PAGE_SIZES)).toBe(25);
    expect(getMinimumPageSizeForNumberOfItems(25, PAGE_SIZES)).toBe(25);
    expect(getMinimumPageSizeForNumberOfItems(26, PAGE_SIZES)).toBe(50);
    expect(getMinimumPageSizeForNumberOfItems(101, PAGE_SIZES)).toBe(Infinity);
  });

  it('defaults to Infinity if the number of items is higher than the highest page size', () => {
    expect(getMinimumPageSizeForNumberOfItems(100, [25, 50])).toBe(Infinity);
  });
});

describe('PaginationFooter component', () => {
  it('renders custom page size options when provided', async () => {
    renderWithTheme(
      <PaginationFooter
        count={150}
        customOptions={[
          { label: 'Show 15', value: 15 },
          { label: 'Show 25', value: 25 },
        ]}
        handlePageChange={vi.fn()}
        handleSizeChange={vi.fn()}
        page={1}
        pageSize={15}
      />
    );

    const select = screen.getByLabelText('Number of items to show');
    await userEvent.click(select);

    expect(screen.getByRole('option', { name: 'Show 15' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Show 25' })).toBeVisible();
  });
});
