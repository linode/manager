import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NO_ASSIGNED_DEFAULT_ROLES_TEXT } from '../../Shared/constants';
import { DefaultRoles } from './DefaultRoles';

const loadingTestId = 'circle-progress';

const queryMocks = vi.hoisted(() => ({
  useGetDefaultDelegationAccessQuery: vi.fn().mockReturnValue({}),
  useLocation: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useGetDefaultDelegationAccessQuery:
      queryMocks.useGetDefaultDelegationAccessQuery,
  };
});

describe('DefaultRoles', () => {
  it('should render', async () => {
    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({
      data: {
        account_access: [
          'account_linode_admin',
          'account_linode_creator',
          'account_firewall_creator',
        ],
        entity_access: [],
      },
      isLoading: false,
    });
    const { queryByTestId } = renderWithTheme(<DefaultRoles />);

    await waitForElementToBeRemoved(queryByTestId(loadingTestId));
    expect(screen.getByText('Default Roles for Delegate Users')).toBeVisible();
    expect(screen.getByRole('table')).toBeVisible();
  });
  it('should render empty state', async () => {
    queryMocks.useLocation.mockReturnValue({
      pathname: '/iam/roles/defaults/roles',
    });
    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({
      data: { account_access: [], entity_access: [] },
      isLoading: false,
    });

    renderWithTheme(<DefaultRoles />);

    expect(screen.getByText(NO_ASSIGNED_DEFAULT_ROLES_TEXT)).toBeVisible();
    expect(screen.getByText('Add New Default Roles')).toBeVisible();
  });
});
