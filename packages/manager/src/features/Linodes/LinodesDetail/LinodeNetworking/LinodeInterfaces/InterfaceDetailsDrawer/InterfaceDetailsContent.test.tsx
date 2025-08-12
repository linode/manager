import {
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVlan,
  linodeInterfaceFactoryVPC,
} from '@linode/utilities';
import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { InterfaceDetailsContent } from './InterfaceDetailsContent';

describe('InterfaceDetailsContent', () => {
  it('shows the information for a Public Interface', () => {
    const publicInterface = linodeInterfaceFactoryPublic.build();
    renderWithTheme(<InterfaceDetailsContent {...publicInterface} />);

    expect(screen.getByText('Type')).toBeVisible();
    expect(screen.getByText('Public')).toBeVisible();
    expect(screen.getByText('ID')).toBeVisible();
    expect(screen.getByText('MAC Address')).toBeVisible();
    expect(screen.getByText('IPv4 Addresses')).toBeVisible();
    expect(screen.getByText('IPv6 Addresses')).toBeVisible();
    expect(screen.getByText('Created')).toBeVisible();
    expect(screen.getByText('Modified')).toBeVisible();
  });

  it('shows the information for an IPv4 VPC Interface', () => {
    const vpcInterface = linodeInterfaceFactoryVPC.build({
      vpc: { ipv6: undefined },
    });
    renderWithTheme(<InterfaceDetailsContent {...vpcInterface} />);

    expect(screen.getByText('Type')).toBeVisible();
    expect(screen.getByText('VPC')).toBeVisible();
    expect(screen.getByText('ID')).toBeVisible();
    expect(screen.getByText('MAC Address')).toBeVisible();
    expect(screen.getByText('VPC Label')).toBeVisible();
    expect(screen.getByText('Subnet Label')).toBeVisible();
    expect(screen.getByText('IPv4 Addresses')).toBeVisible();
    expect(screen.queryByText('IPv6 Addresses')).not.toBeInTheDocument();
    expect(screen.getByText('Created')).toBeVisible();
    expect(screen.getByText('Modified')).toBeVisible();
  });

  it('shows the information for a DualStack (IPv4 & IPv6) VPC Interface', () => {
    const vpcInterface = linodeInterfaceFactoryVPC.build();
    renderWithTheme(<InterfaceDetailsContent {...vpcInterface} />);

    expect(screen.getByText('Type')).toBeVisible();
    expect(screen.getByText('VPC')).toBeVisible();
    expect(screen.getByText('ID')).toBeVisible();
    expect(screen.getByText('MAC Address')).toBeVisible();
    expect(screen.getByText('VPC Label')).toBeVisible();
    expect(screen.getByText('Subnet Label')).toBeVisible();
    expect(screen.getByText('IPv4 Addresses')).toBeVisible();
    expect(screen.getByText('IPv6 Addresses')).toBeVisible();
    expect(screen.getByText('Created')).toBeVisible();
    expect(screen.getByText('Modified')).toBeVisible();
  });

  it('shows the information for a VLAN Interface', () => {
    const vlanInterface = linodeInterfaceFactoryVlan.build();
    renderWithTheme(<InterfaceDetailsContent {...vlanInterface} />);

    expect(screen.getByText('Type')).toBeVisible();
    expect(screen.getByText('VLAN')).toBeVisible();
    expect(screen.getByText('ID')).toBeVisible();
    expect(screen.getByText('MAC Address')).toBeVisible();
    expect(screen.getByText('VLAN Label')).toBeVisible();
    expect(screen.getByText('IPAM Address')).toBeVisible();
    expect(screen.getByText('Created')).toBeVisible();
    expect(screen.getByText('Modified')).toBeVisible();
  });
});
