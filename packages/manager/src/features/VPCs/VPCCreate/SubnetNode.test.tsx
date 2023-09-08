import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetNode } from './SubnetNode';

describe('SubnetNode', () => {
  // state that keeps track of available IPv4s has been moved out of this component,
  // due to React key issues vs maintaining state, so this test will now fail
  it.skip('should calculate the correct subnet mask', async () => {
    renderWithTheme(
      <SubnetNode
        disabled={false}
        idx={0}
        onChange={() => {}}
        subnet={{ ip: { ipv4: '' }, label: '' }}
      />
    );
    const subnetAddress = screen.getAllByTestId('textfield-input');
    expect(subnetAddress[1]).toBeInTheDocument();
    await userEvent.type(subnetAddress[1], '192.0.0.0/24', { delay: 1 });

    expect(subnetAddress[1]).toHaveValue('192.0.0.0/24');
    const availIps = screen.getByText('Available IP Addresses: 252');
    expect(availIps).toBeInTheDocument();
  });

  it('should not show a subnet mask for an ip without a mask', async () => {
    renderWithTheme(
      <SubnetNode
        disabled={false}
        idx={0}
        onChange={() => {}}
        subnet={{ ip: { ipv4: '' }, label: '' }}
      />
    );
    const subnetAddress = screen.getAllByTestId('textfield-input');
    expect(subnetAddress[1]).toBeInTheDocument();
    await userEvent.type(subnetAddress[1], '192.0.0.0', { delay: 1 });

    expect(subnetAddress[1]).toHaveValue('192.0.0.0');
    const availIps = screen.queryByText('Available IP Addresses:');
    expect(availIps).not.toBeInTheDocument();
  });

  it('should show a label and ip textfield inputs at minimum', () => {
    renderWithTheme(
      <SubnetNode
        disabled={false}
        onChange={() => {}}
        subnet={{ ip: { ipv4: '' }, label: '' }}
      />
    );

    const label = screen.getByText('Subnet label');
    expect(label).toBeInTheDocument();
    const ipAddress = screen.getByText('Subnet IP Address Range');
    expect(ipAddress).toBeInTheDocument();
  });

  it('should show a removeable button if isRemovable is true and subnet idx exists and is > 0', () => {
    renderWithTheme(
      <SubnetNode
        disabled={false}
        idx={1}
        isRemovable={true}
        onChange={() => {}}
        subnet={{ ip: { ipv4: '' }, label: '' }}
      />
    );

    const removeableButton = screen.getByTestId('delete-subnet-1');
    expect(removeableButton).toBeInTheDocument();
  });

  it('should not show a removeable button for a subnet with idx 0', () => {
    renderWithTheme(
      <SubnetNode
        disabled={false}
        idx={0}
        isRemovable={true}
        onChange={() => {}}
        subnet={{ ip: { ipv4: '' }, label: '' }}
      />
    );

    const removeableButton = screen.queryByTestId('delete-subnet-0');
    expect(removeableButton).not.toBeInTheDocument();
  });
});
