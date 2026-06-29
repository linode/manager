import { screen } from '@testing-library/react';
import React from 'react';

import { openActionMenu } from '../../utilities/testHelpers';
import { renderWithProviders } from '../../utilities/testHelpers';
import { AssignedRolesActionMenu } from './AssignedRolesActionMenu';

import type { ExtendedRoleView } from '../types';

const mockOnChangeRole = vi.fn();
const mockOnUnassignRole = vi.fn();
const mockOnViewEntities = vi.fn();
const mockOnUpdateEntities = vi.fn();

const mockAccountRole: ExtendedRoleView = {
  access: 'account_access',
  description:
    'Access to perform any supported action on all resources in the account',
  entity_ids: null,
  entity_type: 'account',
  id: 'account_admin',
  name: 'account_admin',
  permissions: ['create_linode', 'update_linode', 'update_firewall'],
};

const mockEntityRole: ExtendedRoleView = {
  access: 'entity_access',
  description: 'Access to update a linode instance',
  entity_ids: [12345678],
  entity_type: 'linode',
  id: 'linode_contributor',
  name: 'linode_contributor',
  permissions: ['update_linode', 'view_linode'],
};

describe('AssignedRolesActionMenu', () => {
  it('should render actions for account access roles correctly', async () => {
    renderWithProviders(
      <AssignedRolesActionMenu
        handleChangeRole={mockOnChangeRole}
        handleUnassignRole={mockOnUnassignRole}
        handleUpdateEntities={mockOnUpdateEntities}
        handleViewEntities={mockOnViewEntities}
        permissions={{
          is_account_admin: true,
          update_default_delegate_access: true,
        }}
        role={mockAccountRole}
      />
    );

    await openActionMenu();

    expect(screen.getByText('Change Role')).toBeInTheDocument();
    expect(screen.getByText('Unassign Role')).toBeInTheDocument();
    expect(
      screen.queryByText('Update List of Entities')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('View Entities')).not.toBeInTheDocument();
  });

  it('should render actions for entity access roles correctly', async () => {
    renderWithProviders(
      <AssignedRolesActionMenu
        handleChangeRole={mockOnChangeRole}
        handleUnassignRole={mockOnUnassignRole}
        handleUpdateEntities={mockOnUpdateEntities}
        handleViewEntities={mockOnViewEntities}
        permissions={{
          is_account_admin: true,
          update_default_delegate_access: true,
        }}
        role={mockEntityRole}
      />
    );

    await openActionMenu();

    expect(screen.getByText('View Entities')).toBeInTheDocument();
    expect(screen.getByText('Update List of Entities')).toBeInTheDocument();
    expect(screen.getByText('Change Role')).toBeInTheDocument();
    expect(screen.getByText('Unassign Role')).toBeInTheDocument();
  });
});
