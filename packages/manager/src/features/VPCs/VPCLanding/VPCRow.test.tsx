import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { vpcFactory } from 'src/factories/vpcs';
import {
  renderWithTheme,
  resizeScreenSize,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { VPCRow } from './VPCRow';

describe('VPC Table Row', () => {
  it('should render a VPC row', () => {
    const vpc = vpcFactory.build();
    resizeScreenSize(1600);

    const { getAllByText, getByText } = renderWithTheme(
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
    getByText(vpc.label);
    getAllByText(vpc.id);
    getAllByText(vpc.subnets.length);
    // Check if actions were rendered
    getByText('Edit');
    getByText('Delete');
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

  it('should disable edit and delete buttons for LKE-E VPCs', () => {
    const vpc = vpcFactory.build({
      description: 'workload VPC for LKE Enterprise Cluster lke1234567',
      label: 'lke1234567',
    });
    const { getAllByRole } = renderWithTheme(
      wrapWithTableBody(
        <VPCRow
          handleDeleteVPC={vi.fn()}
          handleEditVPC={vi.fn()}
          isNodebalancerVPCEnabled
          vpc={vpc}
        />
      )
    );
    const actionButtons = getAllByRole('button');
    actionButtons.forEach((button) => expect(button).toBeDisabled());
  });
});
