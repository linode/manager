import { waitFor } from '@testing-library/react';
import React from 'react';

import { createProfile } from '../../factories';
import {
  mockMatchMedia,
  renderWithProviders,
  wrapWithTableBody,
} from '../../utilities/testHelpers';
import { UsersLandingTableHead } from './UsersLandingTableHead';

import type { SortOrder } from './UsersLandingTableHead';

// Because the table row hides certain columns on small viewport sizes,
// we must use this.
beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

const defaultProps = {
  order: {
    handleOrderChange: vi.fn(),
    order: 'asc' as SortOrder,
    orderBy: 'username',
  },
};

describe('UsersLandingTableHead', () => {
  it('renders User type, Username, Email Address, and Last Login columns for a Child user', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ user_type: 'child' }),
    });

    const { getByText } = renderWithProviders(
      wrapWithTableBody(<UsersLandingTableHead {...defaultProps} />)
    );

    await waitFor(() => {
      expect(getByText('User Type')).toBeVisible();
    });
    expect(getByText('Username')).toBeVisible();
    expect(getByText('Email Address')).toBeVisible();
    expect(getByText('Last Login')).toBeVisible();
  });

  it('does not render User type column when user is not a child', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ user_type: 'default' }),
    });

    const { getByText, queryByText } = renderWithProviders(
      wrapWithTableBody(<UsersLandingTableHead {...defaultProps} />)
    );

    expect(queryByText('User Type')).not.toBeInTheDocument();
    expect(getByText('Username')).toBeVisible();
    expect(getByText('Email Address')).toBeVisible();
    expect(getByText('Last Login')).toBeVisible();
  });
});
