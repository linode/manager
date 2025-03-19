import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import VPCCreate from './VPCCreate';

beforeEach(() => {
  // ignores the console errors in these tests as they're supposed to happen
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

vi.mock('@linode/utilities');

describe('VPC create page', () => {
  it('should render the vpc and subnet sections', () => {
    const { getAllByText } = renderWithTheme(<VPCCreate />);

    getAllByText('Region');
    getAllByText('VPC Label');
    getAllByText('Region');
    getAllByText('Description');
    getAllByText('Subnets');
    getAllByText('Subnet Label');
    getAllByText('Subnet IP Address Range');
    getAllByText('Add another Subnet');
    getAllByText('Create VPC');
  });

  it('should add and delete subnets correctly', async () => {
    renderWithTheme(<VPCCreate />);
    const addSubnet = screen.getByText('Add another Subnet');
    expect(addSubnet).toBeInTheDocument();
    await userEvent.click(addSubnet);

    const subnetLabels = screen.getAllByText('Subnet Label');
    const subnetIps = screen.getAllByText('Subnet IP Address Range');
    expect(subnetLabels).toHaveLength(2);
    expect(subnetIps).toHaveLength(2);

    const deleteSubnet = screen.getByTestId('delete-subnet-1');
    expect(deleteSubnet).toBeInTheDocument();
    await userEvent.click(deleteSubnet);

    const subnetLabelAfter = screen.getAllByText('Subnet Label');
    const subnetIpsAfter = screen.getAllByText('Subnet IP Address Range');
    expect(subnetLabelAfter).toHaveLength(1);
    expect(subnetIpsAfter).toHaveLength(1);
  });

  it('should display that a subnet ip is invalid and require a subnet label if a user adds an invalid subnet ip', async () => {
    renderWithTheme(<VPCCreate />);
    const subnetIp = screen.getByText('Subnet IP Address Range');
    expect(subnetIp).toBeInTheDocument();
    const createVPCButton = screen.getByText('Create VPC');
    expect(createVPCButton).toBeInTheDocument();

    await userEvent.type(subnetIp, 'bad');
    await userEvent.click(createVPCButton);

    const badSubnetIP = screen.getByText(
      'The IPv4 range must be in CIDR format.'
    );
    expect(badSubnetIP).toBeInTheDocument();
    expect(
      screen.getAllByText('Label must be between 1 and 64 characters.')
    ).toHaveLength(2);
  });

  it('should have a default value for the subnet ip address', () => {
    const { getAllByTestId } = renderWithTheme(<VPCCreate />);
    const subnetIP = getAllByTestId('textfield-input');
    expect(subnetIP[4]).toBeInTheDocument();
    expect(subnetIP[4]).toHaveValue('10.0.0.0/24');
  });
});
