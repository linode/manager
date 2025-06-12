import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UpdateEntitiesDrawer } from './UpdateEntitiesDrawer';

import type { ExtendedRoleView } from '../types';

const queryMocks = vi.hoisted(() => ({
  useAccountEntities: vi.fn().mockReturnValue({}),
  useAccountRoles: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
    useUserRoles: queryMocks.useUserRoles,
  };
});

const mockEntities = [
  accountEntityFactory.build({
    id: 1,
    label: 'Linode 1',
    type: 'linode',
  }),
  accountEntityFactory.build({
    id: 2,
    label: 'Linode 2',
    type: 'linode',
  }),
];

vi.mock('src/queries/entities/entities', async () => {
  const actual = await vi.importActual<any>('src/queries/entities/entities');
  return {
    ...actual,
    useAccountEntities: queryMocks.useAccountEntities,
  };
});

const mockRole: ExtendedRoleView = {
  access: 'entity_access',
  description: 'Access to update a linode instance',
  entity_ids: [1],
  entity_names: ['Linode 1'],
  entity_type: 'linode',
  id: 'linode_contributor',
  name: 'linode_contributor',
  permissions: ['update_linode', 'view_linode'],
};

const props = {
  onClose: vi.fn(),
  open: true,
  role: mockRole,
};

const mockUpdateUserRole = vi.fn();
vi.mock('@linode/api-v4', async () => {
  return {
    ...(await vi.importActual<any>('@linode/api-v4')),
    updateUserRoles: (username: string, data: any) => {
      mockUpdateUserRole(data);
      return Promise.resolve(props);
    },
  };
});

describe('UpdateEntitiesDrawer', () => {
  it('should render correctly', () => {
    renderWithTheme(<UpdateEntitiesDrawer {...props} />);

    // Verify the title renders
    expect(screen.getByText('Update List of Entities')).toBeVisible();

    // Verify the description renders
    expect(
      screen.getByText('Add or remove entities attached to the role.')
    ).toBeVisible();

    // Verify the role name renders
    expect(screen.getByText(mockRole.name)).toBeVisible();
  });

  it('should prefill the form with assigned entities', () => {
    renderWithTheme(<UpdateEntitiesDrawer {...props} />);

    // Verify the prefilled entities
    expect(screen.getByText('Linode 1')).toBeVisible();
  });

  it('should allow updating entities', async () => {
    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });
    queryMocks.useUserRoles.mockReturnValue({
      data: {
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [
          {
            id: 1,
            roles: ['linode_contributor'],
            type: 'linode',
          },
        ],
      },
    });

    renderWithTheme(<UpdateEntitiesDrawer {...props} />);

    const autocomplete = screen.getByRole('combobox');

    // Verify that 'Linode 1' is initially selected
    expect(screen.getByText('Linode 1')).toBeVisible();

    // Open the dropdown
    await userEvent.click(autocomplete);

    // Type to filter options
    await userEvent.type(autocomplete, 'Linode 2');

    // Wait for and select the 'Linode 2' option
    const newRole = await screen.findByText('Linode 2');
    await userEvent.click(newRole);

    await waitFor(() => {
      expect(screen.getAllByText('Linode 2')[0]).toBeInTheDocument();
    });

    // Submit the form
    const submitButton = screen.getByTestId('submit');
    await userEvent.click(submitButton);

    // Verify the mutation was called with the updated entities
    await waitFor(() => {
      expect(mockUpdateUserRole).toHaveBeenCalledWith({
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [
          {
            id: 1,
            roles: ['linode_contributor'],
            type: 'linode',
          },
          {
            id: 2,
            roles: ['linode_contributor'],
            type: 'linode',
          },
        ],
      });
    });
  });

  it('should close the drawer when cancel is clicked', async () => {
    renderWithTheme(<UpdateEntitiesDrawer {...props} />);

    // Click the cancel button
    const cancelButton = screen.getByTestId('cancel');
    await userEvent.click(cancelButton);

    // Verify the onClose callback was called
    expect(props.onClose).toHaveBeenCalled();
  });
});
