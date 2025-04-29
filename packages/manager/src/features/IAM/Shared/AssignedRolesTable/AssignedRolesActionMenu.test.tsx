import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignedRolesActionMenu } from './AssignedRolesActionMenu';

import type { ExtendedRoleMap } from '../types';

const mockOnChangeRole = vi.fn();
const mockOnUnassignRole = vi.fn();
const mockOnViewEntities = vi.fn();
const mockOnUpdateEntities = vi.fn();

const mockAccountRole: ExtendedRoleMap = {
  access: 'account_access',
  description:
    'Access to perform any supported action on all resources in the account',
  entity_ids: null,
  entity_type: 'account',
  id: 'account_admin',
  name: 'account_admin',
  permissions: ['create_linode', 'update_linode', 'update_firewall'],
};

const mockEntityRole: ExtendedRoleMap = {
  access: 'entity_access',
  description: 'Access to update a linode instance',
  entity_ids: [12345678],
  entity_type: 'linode',
  id: 'linode_contributor',
  name: 'linode_contributor',
  permissions: ['update_linode', 'view_linode'],
};

describe('AssignedRolesActionMenu', () => {
  it('should render actions for account access roles correctly', () => {
    const { getByRole, queryByText } = renderWithTheme(
      <AssignedRolesActionMenu
        handleChangeRole={mockOnChangeRole}
        handleUnassignRole={mockOnUnassignRole}
        handleUpdateEntities={mockOnUpdateEntities}
        handleViewEntities={mockOnViewEntities}
        role={mockAccountRole}
      />
    );

    const actionBtn = getByRole('button');
    expect(actionBtn).toBeInTheDocument();
    fireEvent.click(actionBtn);

    expect(queryByText('Change Role')).toBeInTheDocument();
    expect(queryByText('Unassign Role')).toBeInTheDocument();
    expect(queryByText('Update List of Entities')).not.toBeInTheDocument();
    expect(queryByText('View Entities')).not.toBeInTheDocument();
  });

  it('should render actions for entity access roles correctly', () => {
    const { getByRole, queryByText } = renderWithTheme(
      <AssignedRolesActionMenu
        handleChangeRole={mockOnChangeRole}
        handleUnassignRole={mockOnUnassignRole}
        handleUpdateEntities={mockOnUpdateEntities}
        handleViewEntities={mockOnViewEntities}
        role={mockEntityRole}
      />
    );

    // Check if "Manage Access" action is present
    const actionBtn = getByRole('button');
    expect(actionBtn).toBeInTheDocument();
    fireEvent.click(actionBtn);

    expect(queryByText('View Entities')).toBeInTheDocument();
    expect(queryByText('Update List of Entities')).toBeInTheDocument();
    expect(queryByText('Change Role')).toBeInTheDocument();
    expect(queryByText('Unassign Role')).toBeInTheDocument();
  });
});
