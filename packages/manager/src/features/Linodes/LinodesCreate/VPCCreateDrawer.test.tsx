import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { VPCCreateDrawer } from './VPCCreateDrawer';

const props = {
  handleSelectVPC: jest.fn(),
  onClose: jest.fn(),
  open: true,
};

describe('VPC Create Drawer', () => {
  it('should render the vpc and subnet sections', () => {
    const { getAllByText } = renderWithTheme(<VPCCreateDrawer {...props} />);

    getAllByText('Region');
    getAllByText('VPC Label');
    getAllByText('Region');
    getAllByText('Description');
    getAllByText('Subnets');
    getAllByText('Subnet Label');
    getAllByText('Subnet IP Address Range');
    getAllByText('Add another Subnet');
    getAllByText('Cancel');
    getAllByText('Create VPC');
  });

  it('should not be able to remove the first subnet', () => {
    renderWithTheme(<VPCCreateDrawer {...props} />);

    const deleteSubnet = screen.queryByTestId('delete-subnet-0');
    expect(deleteSubnet).not.toBeInTheDocument();
  });

  it('should close the drawer', () => {
    renderWithTheme(<VPCCreateDrawer {...props} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
