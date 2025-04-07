import { fireEvent } from '@testing-library/react';
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
  it('should display no entities text if there are no entity roles assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build({
        account_access: ['account_admin'],
        entity_access: [],
      }),
    });

    const { getByText } = renderWithTheme(<UserEntities />);

    expect(getByText('Assigned Entities')).toBeInTheDocument();

    expect(getByText(NO_ASSIGNED_ENTITIES_TEXT)).toBeInTheDocument();
  });

  it('should display no entities text if there are roles assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build({
        account_access: [],
        entity_access: [],
      }),
    });

    const { getByText } = renderWithTheme(<UserEntities />);

    expect(getByText('Assigned Entities')).toBeInTheDocument();

    expect(getByText(NO_ASSIGNED_ENTITIES_TEXT)).toBeInTheDocument();
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

    const { getAllByLabelText, getByText } = renderWithTheme(<UserEntities />);

    expect(getByText('firewall_admin')).toBeInTheDocument();
    expect(getByText('firewall-1')).toBeInTheDocument();

    const actionMenuButton = getAllByLabelText('action menu')[0];
    expect(actionMenuButton).toBeInTheDocument();

    fireEvent.click(actionMenuButton);
    expect(getByText('Change Role')).toBeInTheDocument();
    expect(getByText('Remove Assignment')).toBeInTheDocument();
  });
});
