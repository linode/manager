import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { subnetFactory } from 'src/factories';
import { vpcFactory } from 'src/factories/vpcs';
import {
  renderWithTheme,
  resizeScreenSize,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { VPCRow } from './VPCRow';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      update_vpc: true,
      delete_vpc: true,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('VPC Table Row', () => {
  it('should render a VPC row', () => {
    const vpc = vpcFactory.build({ id: 24, subnets: [subnetFactory.build()] });
    resizeScreenSize(1600);

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <VPCRow
          handleDeleteVPC={vi.fn()}
          handleEditVPC={vi.fn()}
          isNodebalancerVPCEnabled
          vpc={vpc}
        />
      )
    );

    // Check to see if the row rendered some data
    expect(getByText(vpc.label)).toBeVisible();
    expect(getByText(vpc.id)).toBeVisible();
    expect(getByText(vpc.subnets.length)).toBeVisible(); // 1 subnet
    // Check if actions were rendered
    expect(getByText('Edit')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
  });

  it('should have a delete button that calls the provided callback when clicked', async () => {
    const vpc = vpcFactory.build();
    const handleDelete = vi.fn();
    const { getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <VPCRow
          handleDeleteVPC={handleDelete}
          handleEditVPC={vi.fn()}
          isNodebalancerVPCEnabled
          vpc={vpc}
        />
      )
    );
    const deleteBtn = getByTestId('Delete');
    await userEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalled();
  });

  it('should have an edit button that calls the provided callback when clicked', async () => {
    const vpc = vpcFactory.build();
    const handleEdit = vi.fn();
    const { getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <VPCRow
          handleDeleteVPC={vi.fn()}
          handleEditVPC={handleEdit}
          isNodebalancerVPCEnabled
          vpc={vpc}
        />
      )
    );
    const editButton = getByTestId('Edit');
    await userEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalled();
  });

  it('should disable "Edit" and "Delete" button if user does not have "update_vpc" and "delete_vpc" permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: false,
        delete_vpc: false,
      },
    });
    const vpc = vpcFactory.build();
    const handleEdit = vi.fn();
    const { getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <VPCRow
          handleDeleteVPC={vi.fn()}
          handleEditVPC={handleEdit}
          isNodebalancerVPCEnabled
          vpc={vpc}
        />
      )
    );
    const editButton = getByTestId('Edit');
    expect(editButton).toBeDisabled();
    const deleteButton = getByTestId('Delete');
    expect(deleteButton).toBeDisabled();
  });
  it('should enable "Edit" and "Delete" button if user has "update_vpc" and "delete_vpc" permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: true,
        delete_vpc: true,
      },
    });
    const vpc = vpcFactory.build();
    const handleEdit = vi.fn();
    const { getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <VPCRow
          handleDeleteVPC={vi.fn()}
          handleEditVPC={handleEdit}
          isNodebalancerVPCEnabled
          vpc={vpc}
        />
      )
    );
    const editButton = getByTestId('Edit');
    expect(editButton).toBeEnabled();
    const deleteButton = getByTestId('Delete');
    expect(deleteButton).toBeEnabled();
  });
});
