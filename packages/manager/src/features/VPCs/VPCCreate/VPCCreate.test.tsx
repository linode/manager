import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import VPCCreate from './VPCCreate';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      create_vpc: true,
    },
  })),
}));
vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

beforeEach(() => {
  // ignores the console errors in these tests as they're supposed to happen
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

vi.mock('@linode/utilities');

describe('VPC create page', () => {
  it('should render the vpc and subnet sections', () => {
    const { getByText } = renderWithTheme(<VPCCreate />);

    expect(getByText('Region')).toBeVisible();
    expect(getByText('VPC Label')).toBeVisible();
    expect(getByText('Region')).toBeVisible();
    expect(getByText('Description')).toBeVisible();
    expect(getByText('Subnets')).toBeVisible();
    expect(getByText('Subnet Label')).toBeVisible();
    expect(getByText('Subnet IP Address Range')).toBeVisible();
    expect(getByText('Add another Subnet')).toBeVisible();
    expect(getByText('Create VPC')).toBeVisible();
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

  it('should disable inputs if user does not have create_vpc permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_vpc: false,
      },
    });
    const { getByLabelText, getByText } = renderWithTheme(<VPCCreate />);

    expect(getByLabelText('Region')).toBeDisabled();
    expect(getByLabelText('VPC Label')).toBeDisabled();
    const description = screen.getByRole('textbox', { name: /description/i });
    expect(description).toBeDisabled();
    expect(getByLabelText('Subnet Label')).toBeDisabled();
    expect(getByLabelText('Subnet IP Address Range')).toBeDisabled();
    expect(getByText('Add another Subnet')).toBeDisabled();
    expect(getByText('Create VPC')).toBeDisabled();
  });

  it('should enable inputs if user has create_vpc permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_vpc: true,
      },
    });
    const { getByLabelText, getByText } = renderWithTheme(<VPCCreate />);

    expect(getByLabelText('Region')).toBeEnabled();
    expect(getByLabelText('VPC Label')).toBeEnabled();
    const description = screen.getByRole('textbox', { name: /description/i });
    expect(description).toBeEnabled();
    expect(getByLabelText('Subnet Label')).toBeEnabled();
    expect(getByLabelText('Subnet IP Address Range')).toBeEnabled();
    expect(getByText('Add another Subnet')).toBeEnabled();
    expect(getByText('Create VPC')).toBeEnabled();
  });
});
