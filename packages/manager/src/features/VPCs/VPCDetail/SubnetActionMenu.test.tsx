import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { subnetFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetActionMenu } from './SubnetActionMenu';

afterEach(() => {
  vi.clearAllMocks();
});

const props = {
  handleAssignLinodes: vi.fn(),
  handleDelete: vi.fn(),
  handleEdit: vi.fn(),
  handleUnassignLinodes: vi.fn(),
  numLinodes: 1,
  subnet: subnetFactory.build({ label: 'subnet-1' }),
  vpcId: 1,
};

describe('SubnetActionMenu', () => {
  it('should render the subnet action menu', () => {
    const screen = renderWithTheme(<SubnetActionMenu {...props} />);
    const actionMenu = screen.getByLabelText(`Action menu for Subnet subnet-1`);
    fireEvent.click(actionMenu);
    screen.getByText('Assign Linodes');
    screen.getByText('Unassign Linodes');
    screen.getByText('Edit');
    screen.getByText('Delete');
  });

  it('should not allow the delete button to be clicked', () => {
    const screen = renderWithTheme(<SubnetActionMenu {...props} />);
    const actionMenu = screen.getByLabelText(`Action menu for Subnet subnet-1`);
    fireEvent.click(actionMenu);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(props.handleDelete).not.toHaveBeenCalled();
    const tooltipText = screen.getByLabelText(
      'Linodes assigned to a subnet must be unassigned before the subnet can be deleted.'
    );
    expect(tooltipText).toBeInTheDocument();
  });

  it('should allow the delete button to be clicked', () => {
    const screen = renderWithTheme(
      <SubnetActionMenu {...props} numLinodes={0} />
    );
    const actionMenu = screen.getByLabelText(`Action menu for Subnet subnet-1`);
    fireEvent.click(actionMenu);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(props.handleDelete).toHaveBeenCalled();
    const tooltipText = screen.queryByLabelText(
      'Linodes assigned to a subnet must be unassigned before the subnet can be deleted.'
    );
    expect(tooltipText).not.toBeInTheDocument();
  });

  it('should allow the edit button to be clicked', () => {
    const screen = renderWithTheme(
      <SubnetActionMenu {...props} numLinodes={0} />
    );
    const actionMenu = screen.getByLabelText(`Action menu for Subnet subnet-1`);
    fireEvent.click(actionMenu);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    expect(props.handleEdit).toHaveBeenCalled();
  });

  it('should allow the Assign Linodes button to be clicked', () => {
    const screen = renderWithTheme(<SubnetActionMenu {...props} />);
    const actionMenu = screen.getByLabelText(`Action menu for Subnet subnet-1`);
    fireEvent.click(actionMenu);

    const assignButton = screen.getByText('Assign Linodes');
    fireEvent.click(assignButton);
    expect(props.handleAssignLinodes).toHaveBeenCalled();
  });
});
