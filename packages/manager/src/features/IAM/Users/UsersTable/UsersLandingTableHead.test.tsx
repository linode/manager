import { profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { UsersLandingTableHead } from './UsersLandingTableHead';

import type { Order } from '@linode/utilities';

// Because the table row hides certain columns on small viewport sizes,
// we must use this.
beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

const defaultProps = {
  order: {
    handleOrderChange: vi.fn(),
    order: 'asc' as Order,
    orderBy: 'username',
  },
};

describe('UsersLandingTableHead', () => {
  it('renders User type, Username, Email Address, and Last Login columns for a Child user when isIAMDelegationEnabled flag is enabled', async () => {
    server.use(
      // Mock the active profile for the child account.
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ user_type: 'child' }));
      })
    );

    queryMocks.useFlags.mockReturnValue({
      iamDelegation: { enabled: true },
    });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<UsersLandingTableHead {...defaultProps} />)
    );

    await waitFor(() => {
      expect(getByText('User Type')).toBeVisible();
    });
    expect(getByText('Username')).toBeVisible();
    expect(getByText('Email Address')).toBeVisible();
    expect(getByText('Last Login')).toBeVisible();
  });

  it('does not render User type column when isIAMDelegationEnabled flag is off and logged user is not a child', async () => {
    server.use(
      // Mock the active profile for the default account.
      http.get('*/profile', () => {
        return HttpResponse.json(
          profileFactory.build({ user_type: 'default' })
        );
      })
    );

    queryMocks.useFlags.mockReturnValue({
      iamDelegation: { enabled: false },
    });

    const { getByText, queryByText } = renderWithTheme(
      wrapWithTableBody(<UsersLandingTableHead {...defaultProps} />)
    );

    expect(queryByText('User Type')).not.toBeInTheDocument();
    expect(getByText('Username')).toBeVisible();
    expect(getByText('Email Address')).toBeVisible();
    expect(getByText('Last Login')).toBeVisible();
  });
});
