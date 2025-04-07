import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { userPermissionsFactory } from 'src/factories/userPermissions';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NO_ASSIGNED_ROLES_TEXT } from '../../Shared/constants';
import { UserRoles } from './UserRoles';

const mockEntities = [
  accountEntityFactory.build({
    id: 7,
    type: 'linode',
  }),
];

const queryMocks = vi.hoisted(() => ({
  useAccountEntities: vi.fn().mockReturnValue({}),
  useAccountPermissions: vi.fn().mockReturnValue({}),
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

vi.mock('src/queries/entities/entities', async () => {
  const actual = await vi.importActual<any>('src/queries/entities/entities');
  return {
    ...actual,
    useAccountEntities: queryMocks.useAccountEntities,
  };
});

describe('UserRoles', () => {
  it('should display no roles text if there are roles assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build({
        account_access: [],
        entity_access: [],
      }),
    });

    const { getByText } = renderWithTheme(<UserRoles />);

    expect(getByText('Assigned Roles')).toBeInTheDocument();

    expect(getByText(NO_ASSIGNED_ROLES_TEXT)).toBeInTheDocument();
  });

  it('should display table if there are no entity access roles assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build({
        account_access: ['account_admin'],
        entity_access: [],
      }),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    const { getByText } = renderWithTheme(<UserRoles />);

    expect(getByText('Assigned Roles')).toBeInTheDocument();

    expect(getByText(/All Entities/i)).toBeInTheDocument();
    expect(getByText('account_admin')).toBeInTheDocument();
  });

  it('should display table if there are no account access roles assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build({
        account_access: [],
        entity_access: [
          {
            id: 1,
            roles: ['firewall_admin'],
            type: 'firewall',
          },
        ],
      }),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    const { getByText } = renderWithTheme(<UserRoles />);

    expect(getByText('Assigned Roles')).toBeInTheDocument();

    expect(getByText('firewall_admin')).toBeInTheDocument();
  });

  it('should display roles and menu when data is available', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
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
      data: userPermissionsFactory.build(),
    });

    const { getByRole, getByText } = renderWithTheme(<UserRoles />);

    const btn = getByText('Assign New Role');
    fireEvent.click(btn);
    const drawer = getByRole('dialog');

    await waitFor(() => expect(drawer).toBeInTheDocument());
  });
});
