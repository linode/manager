import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { openActionMenu } from '../../utilities/testHelpers';
import { renderWithProviders } from '../../utilities/testHelpers';
import { AssignedEntitiesActionMenu } from './AssignedEntitiesActionMenu';

import type { EntitiesRole } from '../types';

const mockOnChangeRole = vi.fn();
const mockOnRemoveAssignment = vi.fn();

const mockAssignment: EntitiesRole = {
  access: 'entity_access',
  entity_id: 12345678,
  entity_name: 'example-linode',
  entity_type: 'linode',
  id: 'linode_contributor-12345678',
  role_name: 'linode_contributor',
};

describe('AssignedEntitiesActionMenu', () => {
  it('should render actions correctly', async () => {
    renderWithProviders(
      <AssignedEntitiesActionMenu
        assignment={mockAssignment}
        handleChangeRole={mockOnChangeRole}
        handleRemoveAssignment={mockOnRemoveAssignment}
        permissions={{
          is_account_admin: true,
          update_default_delegate_access: true,
        }}
      />
    );

    await openActionMenu();

    expect(screen.getByText('Change Role')).toBeInTheDocument();
    expect(screen.getByText('Remove Assignment')).toBeInTheDocument();
  });

  it('should call handlers when actions are selected', async () => {
    renderWithProviders(
      <AssignedEntitiesActionMenu
        assignment={mockAssignment}
        handleChangeRole={mockOnChangeRole}
        handleRemoveAssignment={mockOnRemoveAssignment}
        permissions={{
          is_account_admin: true,
          update_default_delegate_access: true,
        }}
      />
    );

    await openActionMenu();
    await userEvent.click(screen.getByText('Change Role'));
    expect(mockOnChangeRole).toHaveBeenCalledWith(mockAssignment);

    await openActionMenu();
    await userEvent.click(screen.getByText('Remove Assignment'));
    expect(mockOnRemoveAssignment).toHaveBeenCalledWith(mockAssignment);
  });
});
