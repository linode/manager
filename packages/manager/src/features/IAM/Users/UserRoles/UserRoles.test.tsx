import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { accountResourcesFactory } from 'src/factories/accountResources';
import { userPermissionsFactory } from 'src/factories/userPermissions';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NO_ASSIGNED_ROLES_TEXT } from '../../Shared/constants';
import { UserRoles } from './UserRoles';

const queryMocks = vi.hoisted(() => ({
  useAccountPermissions: vi.fn().mockReturnValue({}),
  useAccountResources: vi.fn().mockReturnValue({}),
  useAccountUserPermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/iam/iam', async () => {
  const actual = await vi.importActual<any>('src/queries/iam/iam');
  return {
    ...actual,
    useAccountPermissions: queryMocks.useAccountPermissions,
    useAccountUserPermissions: queryMocks.useAccountUserPermissions,
  };
});

vi.mock('src/queries/resources/resources', async () => {
  const actual = await vi.importActual<any>('src/queries/resources/resources');
  return {
    ...actual,
    useAccountResources: queryMocks.useAccountResources,
  };
});

describe('UserRoles', () => {
  it('should display no roles text if there are no roles assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: {},
    });

    const { getByText } = renderWithTheme(<UserRoles />);

    expect(getByText('Assigned Roles')).toBeInTheDocument();

    expect(getByText(NO_ASSIGNED_ROLES_TEXT)).toBeInTheDocument();
  });

  it('should display roles and menu when data is available', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountResources.mockReturnValue({
      data: accountResourcesFactory.build(),
    });

    const { getAllByLabelText, getAllByText, getByText } = renderWithTheme(
      <UserRoles />
    );

    expect(getByText('account_linode_admin')).toBeInTheDocument();
    expect(getAllByText('All Linodes')[0]).toBeInTheDocument();

    const actionMenuButton = getAllByLabelText('action menu')[0];
    expect(actionMenuButton).toBeInTheDocument();

    fireEvent.click(actionMenuButton);
    expect(getByText('Change Role')).toBeInTheDocument();
    expect(getByText('Unassign Role')).toBeInTheDocument();
  });

  it('should open drawer when button is clicked', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: {},
    });

    const { getByRole } = renderWithTheme(<UserRoles />);

    const btn = getByRole('button');
    fireEvent.click(btn);
    const drawer = getByRole('dialog');

    await waitFor(() => expect(drawer).toBeInTheDocument());
  });
});
