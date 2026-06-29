import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { AssignedEntities } from './AssignedEntities';

import type { ExtendedRoleView } from '../../Shared/types';

const handleClick = vi.fn();
const handleRemove = vi.fn();

const mockRole: ExtendedRoleView = {
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
    renderWithProviders(
      <AssignedEntities
        onButtonClick={handleClick}
        onRemoveAssignment={handleRemove}
        role={mockRole}
      />
    );

    const chips = screen.getAllByTestId('entities');
    expect(chips).toHaveLength(mockRole.entity_names!.length);
  });

  it('calls onRemoveAssignment when the delete icon is clicked', () => {
    renderWithProviders(
      <AssignedEntities
        onButtonClick={handleClick}
        onRemoveAssignment={handleRemove}
        role={mockRole}
      />
    );

    const removeButton = screen
      .getByTestId('entities')
      .querySelector('cds-button');
    expect(removeButton).toBeTruthy();

    fireEvent.click(removeButton!);

    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleRemove).toHaveBeenCalledWith(
      { name: mockRole.entity_names![0], id: mockRole.entity_ids![0] },
      mockRole
    );
  });

  it('renders a tooltip with the entity name when the name is longer than 30 characters', () => {
    const longName = 'this-is-a-long-entity-name-that-needs-to-be-truncated';
    const { container } = renderWithProviders(
      <AssignedEntities
        onButtonClick={handleClick}
        onRemoveAssignment={handleRemove}
        role={{ ...mockRole, entity_names: [longName] }}
      />
    );

    const tooltips = Array.from(container.querySelectorAll('cds-tooltip'));
    const entityTooltip = tooltips.find(
      (t) => (t as any).tooltipText === longName
    );
    expect(entityTooltip).toBeDefined();
  });
});
