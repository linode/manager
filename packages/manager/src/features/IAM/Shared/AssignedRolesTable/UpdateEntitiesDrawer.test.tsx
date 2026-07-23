import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createAccountEntity } from '../../factories';
import { submitCdsDrawerForm } from '../../utilities/testHelpers';
import {
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { UpdateEntitiesDrawer } from './UpdateEntitiesDrawer';

import type { ExtendedRoleView } from '../types';

const queryMocks = vi.hoisted(() => ({
  useAllAccountEntities: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
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

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

const mockEntities = [
  createAccountEntity({
    id: 1,
    label: 'Linode 1',
    type: 'linode',
  }),
  createAccountEntity({
    id: 2,
    label: 'Linode 2',
    type: 'linode',
  }),
];

vi.mock('../../queries/entities/entities', async () => {
  const actual = await vi.importActual('../../queries/entities/entities');
  return {
    ...actual,
    useAllAccountEntities: queryMocks.useAllAccountEntities,
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

beforeAll(() => mockMatchMedia());

describe('UpdateEntitiesDrawer', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test_user',
    });
  });

  it('should render correctly', async () => {
    renderWithProviders(<UpdateEntitiesDrawer {...props} />);

    // Verify the title renders
    expect(screen.getByText('Update Entities')).toBeVisible();

    // Verify the description renders
    expect(
      screen.getByText('Add or remove entities attached to the role.')
    ).toBeVisible();

    // Verify the role name renders
    expect(screen.getByText(mockRole.name)).toBeVisible();
  });

  it('should prefill the form with assigned entities', async () => {
    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
      isLoading: false,
    });
    renderWithProviders(<UpdateEntitiesDrawer {...props} />);

    // Verify the prefilled entities
    expect(screen.getByText('Linode 1')).toBeVisible();
  });

  it('should allow updating entities', async () => {
    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
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

    renderWithProviders(<UpdateEntitiesDrawer {...props} />);

    // Linode 1 is initially selected (from role.entity_ids)
    expect(screen.getByText('Linode 1')).toBeVisible();

    // Click Linode 2 row to add it
    await userEvent.click(screen.getByText('Linode 2'));

    await waitFor(() => {
      expect(screen.getAllByText('Linode 2')[0]).toBeInTheDocument();
    });

    // Submit the form
    submitCdsDrawerForm();

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
    renderWithProviders(<UpdateEntitiesDrawer {...props} />);

    // Click the cancel button
    const cancelButton = screen.getByTestId('cancel');
    await userEvent.click(cancelButton);

    // Verify the onClose callback was called
    expect(props.onClose).toHaveBeenCalled();
  });
});
