import * as React from 'react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import VPCCreate from './VPCCreate';
import { renderWithTheme } from 'src/utilities/testHelpers';

beforeEach(() => {
  // ignore the console errors in these tests as they're supposed to happen
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('VPC create page', () => {
  it('should render the vpc and subnet sections', () => {
    const { getAllByText } = renderWithTheme(<VPCCreate />);

    getAllByText('Region');
    getAllByText('VPC label');
    getAllByText('Select a Region');
    getAllByText('Description');
    getAllByText('Subnet');
    getAllByText('Subnet label');
    getAllByText('Subnet IP Range Address');
    getAllByText('Add a Subnet');
    getAllByText('Create VPC');
  });

  it('should require vpc labels and region', async () => {
    renderWithTheme(<VPCCreate />);
    const createVPCButton = screen.getByText('Create VPC');
    expect(createVPCButton).toBeInTheDocument();
    await act(async () => {
      userEvent.click(createVPCButton);
    });

    const regionError = screen.getByText('Region is required');
    expect(regionError).toBeInTheDocument();
    const labelError = screen.getByText('Label is required');
    expect(labelError).toBeInTheDocument();
  });

  it('should add a subnet if the Add a Subnet button is clicked', async () => {
    renderWithTheme(<VPCCreate />);
    const addSubnet = screen.getByText('Add a Subnet');
    expect(addSubnet).toBeInTheDocument();
    await act(async () => {
      userEvent.click(addSubnet);
    });

    const subnetLabels = screen.getAllByText('Subnet label');
    const subnetIps = screen.getAllByText('Subnet IP Range Address');
    expect(subnetLabels).toHaveLength(2);
    expect(subnetIps).toHaveLength(2);
  });

  it('should display that a subnet ip is invalid if a user adds an invalid subnet ip', async () => {
    renderWithTheme(<VPCCreate />);
    const subnetLabel = screen.getByText('Subnet label');
    expect(subnetLabel).toBeInTheDocument();
    const subnetIp = screen.getByText('Subnet IP Range Address');
    expect(subnetIp).toBeInTheDocument();
    const createVPCButton = screen.getByText('Create VPC');
    expect(createVPCButton).toBeInTheDocument();

    await act(async () => {
      await userEvent.type(subnetIp, 'bad ip', { delay: 1 });
      userEvent.click(createVPCButton);
    });
    const badSubnet = screen.getByText('Must be a valid IPv4 or IPv6 address');
    expect(badSubnet).toBeInTheDocument();
  });
});
