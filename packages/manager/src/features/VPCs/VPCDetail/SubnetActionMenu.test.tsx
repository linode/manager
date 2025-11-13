import userEvent from '@testing-library/user-event';
import { PointerEventsCheckLevel } from '@testing-library/user-event';
import * as React from 'react';

import { subnetFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetActionMenu } from './SubnetActionMenu';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      update_vpc: true,
      delete_vpc: true,
    },
  })),
  useQueryWithPermissions: vi.fn().mockReturnValue({
    data: [
      { id: 1, label: 'linode-1' },
      { id: 2, label: 'linode-2' },
    ],
    isLoading: false,
    isError: false,
  }),
}));
vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
  useQueryWithPermissions: queryMocks.useQueryWithPermissions,
}));
afterEach(() => {
  vi.clearAllMocks();
});

const props = {
  handleAssignLinodes: vi.fn(),
  handleDelete: vi.fn(),
  handleEdit: vi.fn(),
  handleUnassignLinodes: vi.fn(),
  numLinodes: 1,
  numNodebalancers: 1,
  subnet: subnetFactory.build({ label: 'subnet-1' }),
  vpcId: 1,
};

describe('SubnetActionMenu', () => {
  it('should render the subnet action menu', async () => {
    const view = renderWithTheme(<SubnetActionMenu {...props} />);
    const actionMenu = view.getByLabelText(`Action menu for Subnet subnet-1`);
    await userEvent.click(actionMenu);
    view.getByText('Assign Linodes');
    view.getByText('Unassign Linodes');
    view.getByText('Edit');
    view.getByText('Delete');
  });

  it('should not allow the delete button to be clicked', async () => {
    const view = renderWithTheme(<SubnetActionMenu {...props} />);
    const actionMenu = view.getByLabelText(`Action menu for Subnet subnet-1`);
    await userEvent.click(actionMenu);

    const deleteButton = view.getByRole('menuitem', { name: 'Delete' });
    await userEvent.click(deleteButton, {
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    expect(props.handleDelete).not.toHaveBeenCalled();
    const tooltipText = view.getByLabelText(
      'Linodes assigned to a subnet must be unassigned before the subnet can be deleted.'
    );
    expect(tooltipText).toBeInTheDocument();
  });

  it('should not allow the delete button to be clicked when isNodebalancerVPCEnabled is true', async () => {
    const view = renderWithTheme(<SubnetActionMenu {...props} />, {
      flags: { nodebalancerVpc: true },
    });

    const actionMenu = view.getByLabelText(`Action menu for Subnet subnet-1`);
    await userEvent.click(actionMenu);

    const deleteButton = view.getByText('Delete');
    await userEvent.click(deleteButton, {
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    expect(props.handleDelete).not.toHaveBeenCalled();
    const tooltipText = view.getByLabelText(
      'Resources assigned to a subnet must be unassigned before the subnet can be deleted.'
    );
    expect(tooltipText).toBeInTheDocument();
  });

  it('should allow the delete button to be clicked', async () => {
    const view = renderWithTheme(
      <SubnetActionMenu {...props} numLinodes={0} numNodebalancers={0} />
    );
    const actionMenu = view.getByLabelText(`Action menu for Subnet subnet-1`);
    await userEvent.click(actionMenu);

    const deleteButton = view.getByText('Delete');
    await userEvent.click(deleteButton);
    expect(props.handleDelete).toHaveBeenCalled();
    const tooltipText = view.queryByLabelText(
      'Linodes assigned to a subnet must be unassigned before the subnet can be deleted.'
    );
    expect(tooltipText).not.toBeInTheDocument();
  });

  it('should allow the edit button to be clicked', async () => {
    const view = renderWithTheme(
      <SubnetActionMenu {...props} numLinodes={0} numNodebalancers={0} />
    );
    const actionMenu = view.getByLabelText(`Action menu for Subnet subnet-1`);
    await userEvent.click(actionMenu);

    const editButton = view.getByText('Edit');
    await userEvent.click(editButton);
    expect(props.handleEdit).toHaveBeenCalled();
  });

  it('should allow the Assign Linodes button to be clicked', async () => {
    const view = renderWithTheme(<SubnetActionMenu {...props} />);
    const actionMenu = view.getByLabelText(`Action menu for Subnet subnet-1`);
    await userEvent.click(actionMenu);

    const assignButton = view.getByText('Assign Linodes');
    await userEvent.click(assignButton);
    expect(props.handleAssignLinodes).toHaveBeenCalled();
  });

  it('should disable the Edit button if user does not have update_vpc permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: false,
        delete_vpc: false,
      },
    });
    const view = renderWithTheme(<SubnetActionMenu {...props} />);
    const actionMenu = view.getByLabelText(`Action menu for Subnet subnet-1`);
    await userEvent.click(actionMenu);

    const editButton = view.getByRole('menuitem', { name: 'Edit' });
    expect(editButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable the Edit button if user has update_vpc permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: true,
        delete_vpc: false,
      },
    });
    const view = renderWithTheme(<SubnetActionMenu {...props} />);
    const actionMenu = view.getByLabelText(`Action menu for Subnet subnet-1`);
    await userEvent.click(actionMenu);

    const editButton = view.getByRole('menuitem', { name: 'Edit' });
    expect(editButton).not.toHaveAttribute('aria-disabled', 'true');
  });
});
