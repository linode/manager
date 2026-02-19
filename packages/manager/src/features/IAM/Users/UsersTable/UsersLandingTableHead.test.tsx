import { profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

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
  useProfile: vi.fn().mockReturnValue({}),
  useIsIAMDelegationEnabled: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('src/features/IAM/hooks/useIsIAMEnabled', async () => {
  const actual = await vi.importActual(
    'src/features/IAM/hooks/useIsIAMEnabled'
  );
  return {
    ...actual,
    useIsIAMDelegationEnabled: queryMocks.useIsIAMDelegationEnabled,
  };
});

const defaultProps = {
  order: {
    handleOrderChange: vi.fn(),
    order: 'asc' as Order,
    orderBy: 'username',
  },
  isChildWithDelegationEnabled: true,
};

describe('UsersLandingTableHead', () => {
  beforeEach(() => {
    queryMocks.useIsIAMDelegationEnabled.mockReturnValue({
      isIAMDelegationEnabled: true,
    });
  });

  it('renders User type, Username, Email Address, and Last Login columns for a Child user when isIAMDelegationEnabled flag is enabled', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'child' }),
    });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<UsersLandingTableHead {...defaultProps} />, {
        flags: {
          iamDelegation: { enabled: true },
        },
      })
    );

    await waitFor(() => {
      expect(getByText('User Type')).toBeVisible();
    });
    expect(getByText('Username')).toBeVisible();
    expect(getByText('Email Address')).toBeVisible();
    expect(getByText('Last Login')).toBeVisible();
  });

  it('does not render User type column when isIAMDelegationEnabled flag is off and logged user is not a child', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'default' }),
    });

    const { getByText, queryByText } = renderWithTheme(
      wrapWithTableBody(<UsersLandingTableHead {...defaultProps} />, {
        flags: {
          iamDelegation: { enabled: false },
        },
      })
    );

    expect(queryByText('User Type')).not.toBeInTheDocument();
    expect(getByText('Username')).toBeVisible();
    expect(getByText('Email Address')).toBeVisible();
    expect(getByText('Last Login')).toBeVisible();
  });
});
