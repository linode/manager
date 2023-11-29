import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { act } from 'react-dom/test-utils';

import { renderWithTheme } from 'src/utilities/testHelpers';

import VPCCreate from './VPCCreate';

beforeEach(() => {
  // ignores the console errors in these tests as they're supposed to happen
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

vi.mock('src/utilities/scrollErrorIntoView');

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

  // test fails due to new default value for subnet ip addresses - if we remove default text and just
  // have a placeholder, we can put this test back in
  it.skip('should require vpc labels and region and ignore subnets that are blank', async () => {
    const {
      getAllByTestId,
      getByText,
      getAllByText,
      queryByText,
    } = renderWithTheme(<VPCCreate />);
    const createVPCButton = getByText('Create VPC');
    const subnetIP = getAllByTestId('textfield-input');
    expect(createVPCButton).toBeInTheDocument();
    expect(subnetIP[3]).toBeInTheDocument();
    await act(async () => {
      userEvent.click(createVPCButton);
    });
    const regionError = getByText('Region is required');
    expect(regionError).toBeInTheDocument();
    const labelErrors = getAllByText('Label is required');
    expect(labelErrors).toHaveLength(1);
    const badSubnetIP = queryByText('The IPv4 range must be in CIDR format');
    expect(badSubnetIP).not.toBeInTheDocument();
  });

  it('should add and delete subnets correctly', async () => {
    renderWithTheme(<VPCCreate />);
    const addSubnet = screen.getByText('Add another Subnet');
    expect(addSubnet).toBeInTheDocument();
    await act(async () => {
      userEvent.click(addSubnet);
    });

    const subnetLabels = screen.getAllByText('Subnet Label');
    const subnetIps = screen.getAllByText('Subnet IP Address Range');
    expect(subnetLabels).toHaveLength(2);
    expect(subnetIps).toHaveLength(2);

    const deleteSubnet = screen.getByTestId('delete-subnet-1');
    expect(deleteSubnet).toBeInTheDocument();
    await act(async () => {
      userEvent.click(deleteSubnet);
    });

    const subnetLabelAfter = screen.getAllByText('Subnet Label');
    const subnetIpsAfter = screen.getAllByText('Subnet IP Address Range');
    expect(subnetLabelAfter).toHaveLength(1);
    expect(subnetIpsAfter).toHaveLength(1);
  });

  it('should display that a subnet ip is invalid and require a subnet label if a user adds an invalid subnet ip', async () => {
    renderWithTheme(<VPCCreate />);
    const subnetLabel = screen.getByText('Subnet Label');
    expect(subnetLabel).toBeInTheDocument();
    const subnetIp = screen.getByText('Subnet IP Address Range');
    expect(subnetIp).toBeInTheDocument();
    const createVPCButton = screen.getByText('Create VPC');
    expect(createVPCButton).toBeInTheDocument();

    await act(async () => {
      await userEvent.type(subnetIp, 'bad');
      userEvent.click(createVPCButton);
    });

    const badSubnetIP = screen.getByText(
      'The IPv4 range must be in CIDR format'
    );
    expect(badSubnetIP).toBeInTheDocument();
    const badLabels = screen.getAllByText('Label is required');
    expect(badLabels).toHaveLength(2);
  });

  it('should have a default value for the subnet ip address', () => {
    const { getAllByTestId } = renderWithTheme(<VPCCreate />);
    const subnetIP = getAllByTestId('textfield-input');
    expect(subnetIP[4]).toBeInTheDocument();
    expect(subnetIP[4]).toHaveValue('10.0.4.0/24');
  });
});
