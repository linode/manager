import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignedEntities } from './AssignedEntities';

import type { ExtendedRoleMap } from '../../Shared/types';

const handleClick = vi.fn();
const handleRemove = vi.fn();

const mockRole: ExtendedRoleMap = {
  access: 'entity_access',
  description: 'linode viewer',
  entity_type: 'linode',
  id: 'linode_viewer',
  name: 'linode_viewer',
  permissions: ['create_linode', 'update_linode', 'update_firewall'],
  entity_ids: [1],
  entity_names: ['linode-uk-123'],
};

describe('AssignedEntities', () => {
  it('renders the correct number of entity chips', () => {
    renderWithTheme(
      <AssignedEntities
        onButtonClick={handleClick}
        onRemoveAssignment={handleRemove}
        role={mockRole}
      />
    );

    const chips = screen.getAllByTestId('entities');
    expect(chips).toHaveLength(mockRole.entity_names!.length);
  });

  it('calls onRemoveAssignment when the delete icon is clicked', async () => {
    renderWithTheme(
      <AssignedEntities
        onButtonClick={handleClick}
        onRemoveAssignment={handleRemove}
        role={mockRole}
      />
    );

    const deleteIcons = screen.getAllByTestId('CloseIcon');
    expect(deleteIcons).toHaveLength(mockRole.entity_names!.length);

    // Simulate clicking the delete icon for the first chip
    await userEvent.click(deleteIcons[0]);

    // Ensure the onRemoveAssignment handler is called with the correct arguments
    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleRemove).toHaveBeenCalledWith(
      { name: mockRole.entity_names![0], id: mockRole.entity_ids![0] },
      mockRole
    );
  });
});
