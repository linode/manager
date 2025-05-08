import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { userPermissionsFactory } from 'src/factories/userPermissions';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NO_ASSIGNED_ENTITIES_TEXT } from '../../Shared/constants';
import { UserEntities } from './UserEntities';

const mockEntities = [
  accountEntityFactory.build({
    id: 1,
    label: 'firewall-1',
    type: 'firewall',
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

describe('UserEntities', () => {
  it('should display no entities text if no entity roles are assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build({
        account_access: ['account_admin'],
        entity_access: [],
      }),
    });

    renderWithTheme(<UserEntities />);

    expect(screen.getByText('Entity Access')).toBeVisible();

    expect(screen.getByText(NO_ASSIGNED_ENTITIES_TEXT)).toBeVisible();
  });

  it('should display no entities text if no roles are assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build({
        account_access: [],
        entity_access: [],
      }),
    });

    renderWithTheme(<UserEntities />);

    expect(screen.getByText('Entity Access')).toBeVisible();

    expect(screen.getByText(NO_ASSIGNED_ENTITIES_TEXT)).toBeVisible();
  });

  it('should display entities and menu when data is available', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(<UserEntities />);

    expect(screen.getByText('firewall_admin')).toBeVisible();
    expect(screen.getByText('firewall-1')).toBeVisible();

    const actionMenuButton = screen.getAllByLabelText('action menu')[0];
    expect(actionMenuButton).toBeVisible();

    await userEvent.click(actionMenuButton);
    expect(screen.getByText('Change Role')).toBeVisible();
    expect(screen.getByText('Remove')).toBeVisible();
  });
});
