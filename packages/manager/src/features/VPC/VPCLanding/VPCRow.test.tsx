import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { vpcFactory } from 'src/factories/vpcs';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { VPCRow } from './VPCRow';

describe('VPC Table Row', () => {
  it('should render a VPC row', () => {
    const vpc = vpcFactory.build();

    const { getAllByText, getByText } = renderWithTheme(
      wrapWithTableBody(<VPCRow handleDeleteVPC={jest.fn()} vpc={vpc} />)
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
    const handleDelete = jest.fn();
    const { getAllByRole } = renderWithTheme(
      wrapWithTableBody(<VPCRow handleDeleteVPC={handleDelete} vpc={vpc} />)
    );
    const deleteBtn = getAllByRole('button')[1];
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalled();
  });
});
