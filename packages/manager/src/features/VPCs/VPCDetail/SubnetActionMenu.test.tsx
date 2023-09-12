import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { subnetFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetActionMenu } from './SubnetActionMenu';

afterEach(() => {
  jest.clearAllMocks();
});

const props = {
  handleDelete: jest.fn(),
  handleEdit: jest.fn(),
  numLinodes: 1,
  subnet: subnetFactory.build({ label: 'subnet-1' }),
  vpcId: 1,
};

describe('SubnetActionMenu', () => {
  it('should render the subnet action menu', () => {
    const screen = renderWithTheme(<SubnetActionMenu {...props} />);
    const actionMenu = screen.getByLabelText(`Action menu for Subnet subnet-1`);
    fireEvent.click(actionMenu);
    screen.getByText('Assign Linode');
    screen.getByText('Unassign Linode');
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
});
