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
});
