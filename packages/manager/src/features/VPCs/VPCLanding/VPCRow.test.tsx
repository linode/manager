import { fireEvent } from '@testing-library/react';
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
        <VPCRow handleDeleteVPC={vi.fn()} handleEditVPC={vi.fn()} vpc={vpc} />
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

  it('should have a delete button that calls the provided callback when clicked', () => {
    const vpc = vpcFactory.build();
    const handleDelete = vi.fn();
    const { getAllByRole } = renderWithTheme(
      wrapWithTableBody(
        <VPCRow
          handleDeleteVPC={handleDelete}
          handleEditVPC={vi.fn()}
          vpc={vpc}
        />
      )
    );
    const deleteBtn = getAllByRole('button')[1];
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalled();
  });

  it('should have an edit button that calls the provided callback when clicked', () => {
    const vpc = vpcFactory.build();
    const handleEdit = vi.fn();
    const { getAllByRole } = renderWithTheme(
      wrapWithTableBody(
        <VPCRow
          handleDeleteVPC={vi.fn()}
          handleEditVPC={handleEdit}
          vpc={vpc}
        />
      )
    );
    const editButton = getAllByRole('button')[0];
    fireEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalled();
  });

  it('should disable edit and delete buttons for LKE-E VPCs', () => {
    const vpc = vpcFactory.build({
      description: 'workload VPC for LKE Enterprise Cluster lke1234567',
      label: 'lke1234567',
    });
    const { getAllByRole } = renderWithTheme(
      wrapWithTableBody(
        <VPCRow handleDeleteVPC={vi.fn()} handleEditVPC={vi.fn()} vpc={vpc} />
      )
    );
    const actionButtons = getAllByRole('button');
    actionButtons.forEach((button) => expect(button).toBeDisabled());
  });
});
