import { screen } from '@testing-library/react';
import React from 'react';

import { createAccountEntity } from '../../factories';
import {
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { AssignedPermissionsPanel } from './AssignedPermissionsPanel';

import type { ExtendedRole } from '../utilities';

const queryMocks = vi.hoisted(() => ({
  useAllAccountEntities: vi.fn().mockReturnValue({}),
}));

vi.mock('../../queries/entities/entities', async () => {
  const actual = await vi.importActual('../../queries/entities/entities');
  return {
    ...actual,
    useAllAccountEntities: queryMocks.useAllAccountEntities,
  };
});

const mockAccountAcceessRole: ExtendedRole = {
  access: 'account_access',
  description:
    'Access to perform any supported action on all linode instances in the account',
  entity_type: 'account',
  name: 'account_admin',
  permissions: ['cancel_account'],
};

const mockEntitiesAcceessRole: ExtendedRole = {
  access: 'entity_access',
  description: 'Access to administer a linode instance',
  entity_type: 'linode',
  name: 'linode_admin',
  permissions: [
    'create_linode',
    'boot_linode',
    'rescue_linode',
    'view_linode',
    'update_linode',
    'delete_linode',
  ],
};

const mockEntities = [
  createAccountEntity({
    id: 1,
    label: 'linode-1',
    type: 'linode',
  }),
];

beforeAll(() => mockMatchMedia());

describe('AssignedPermissionsPanel', () => {
  it('renders with the correct context when the access is an account', () => {
    renderWithProviders(
      <AssignedPermissionsPanel
        mode="assign-role"
        role={mockAccountAcceessRole}
      />
    );
    expect(screen.getByText('Entities')).toBeVisible();
    expect(
      screen.getByText(
        'Access to perform any supported action on all linode instances in the account'
      )
    ).toBeVisible();
    expect(screen.getByText('cancel_account')).toBeVisible();
    expect(screen.getByText('Description')).toBeVisible();
  });

  it('does not render Autocomplete when the access is an account', () => {
    renderWithProviders(
      <AssignedPermissionsPanel role={mockAccountAcceessRole} />
    );
    const autocomplete = screen.queryAllByRole('combobox');

    expect(screen.getByText('Entities')).toBeVisible();
    expect(screen.getByText('All entities')).toBeVisible();

    // check that the autocomplete doesn't exist
    expect(autocomplete.length).toBe(0);
    expect(autocomplete[0]).toBeUndefined();
  });

  it('renders with the correct context when the access is an entity', () => {
    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });
    renderWithProviders(
      <AssignedPermissionsPanel role={mockEntitiesAcceessRole} />
    );

    const permissions = screen.getAllByTestId('permission');
    expect(permissions).toHaveLength(6);

    expect(
      screen.getByText('Access to administer a linode instance')
    ).toBeVisible();
    expect(screen.getByText('create_linode')).toBeVisible();
    expect(screen.getByText('Entities')).toBeVisible();

    // SelectionPanel renders entities as table rows instead of a combobox
    expect(screen.getByText('linode-1')).toBeVisible();
  });

  it('renders entities in the table when the access is an entity', () => {
    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });
    renderWithProviders(
      <AssignedPermissionsPanel role={mockEntitiesAcceessRole} />
    );

    // Entity appears directly as a table row
    expect(screen.getByText('linode-1')).toBeVisible();
  });

  it('shows all permissions', () => {
    renderWithProviders(
      <AssignedPermissionsPanel role={mockEntitiesAcceessRole} />
    );

    // All chips should now be visible
    const visibleChips = screen.getAllByTestId('permission');
    expect(visibleChips.length).toBe(
      mockEntitiesAcceessRole.permissions.length
    );
  });

  it('does not render the Entities component when mode is "change-role-for-entity"', () => {
    renderWithProviders(
      <AssignedPermissionsPanel
        mode="change-role-for-entity"
        role={mockEntitiesAcceessRole}
      />
    );

    // Verify that the Entities component is not rendered
    expect(screen.queryByText('Entities')).not.toBeInTheDocument();
  });
});
