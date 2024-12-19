import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { UsersLandingProxyTableHead } from './UsersLandingProxyTableHead';

import type { SortOrder } from './UsersLandingTableHead';

const mockOrder = {
  handleOrderChange: vi.fn(),
  order: 'asc' as SortOrder,
  orderBy: 'username',
};

describe('UsersLandingProxyTableHead', () => {
  it('should render Username cell', () => {
    const { getByText } = renderWithTheme(
      <UsersLandingProxyTableHead order={mockOrder} />
    );

    const username = getByText('Username');
    expect(username).toBeInTheDocument();
  });

  it('should call handleOrderChange when Username sort cell is clicked', () => {
    const { getByText } = renderWithTheme(
      <UsersLandingProxyTableHead order={mockOrder} />
    );

    const usernameCell = getByText('Username');
    expect(usernameCell).toBeInTheDocument();
    fireEvent.click(usernameCell);

    // Expect the handleOrderChange to have been called
    expect(mockOrder.handleOrderChange).toHaveBeenCalled();
  });

  it('should render correctly with order props', () => {
    const { getByText } = renderWithTheme(
      <UsersLandingProxyTableHead order={mockOrder} />
    );

    const usernameCell = getByText('Username');
    expect(usernameCell).toBeInTheDocument();

    expect(usernameCell.closest('span')).toHaveAttribute(
      'aria-label',
      'Sort by username'
    );
  });
});
