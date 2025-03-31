import {
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVPC,
  linodeInterfaceFactoryVlan,
} from '@linode/utilities';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { InterfaceDetailsContent } from './InterfaceDetailsContent';

describe('InterfaceDetailsContent', () => {
  it('shows the information for a Public Interface', () => {
    const publicInterface = linodeInterfaceFactoryPublic.build();
    const { getByText } = renderWithTheme(
      <InterfaceDetailsContent {...publicInterface} />
    );

    expect(getByText('Type')).toBeVisible();
    expect(getByText('Public')).toBeVisible();
    expect(getByText('ID')).toBeVisible();
    expect(getByText('MAC Address')).toBeVisible();
    expect(getByText('IPv4 Addresses')).toBeVisible();
    expect(getByText('IPv6 Addresses')).toBeVisible();
    expect(getByText('Created')).toBeVisible();
    expect(getByText('Modified')).toBeVisible();
  });

  it('shows the information for a VPC Interface', () => {
    const vpcInterface = linodeInterfaceFactoryVPC.build();
    const { getByText } = renderWithTheme(
      <InterfaceDetailsContent {...vpcInterface} />
    );

    expect(getByText('Type')).toBeVisible();
    expect(getByText('VPC')).toBeVisible();
    expect(getByText('ID')).toBeVisible();
    expect(getByText('MAC Address')).toBeVisible();
    expect(getByText('VPC Label')).toBeVisible();
    expect(getByText('Subnet Label')).toBeVisible();
    expect(getByText('IPv4 Addresses')).toBeVisible();
    expect(getByText('Created')).toBeVisible();
    expect(getByText('Modified')).toBeVisible();
  });

  it('shows the information for a VLAN Interface', () => {
    const vlanInterface = linodeInterfaceFactoryVlan.build();
    const { getByText } = renderWithTheme(
      <InterfaceDetailsContent {...vlanInterface} />
    );

    expect(getByText('Type')).toBeVisible();
    expect(getByText('VLAN')).toBeVisible();
    expect(getByText('ID')).toBeVisible();
    expect(getByText('MAC Address')).toBeVisible();
    expect(getByText('VLAN Label')).toBeVisible();
    expect(getByText('IPAM Address')).toBeVisible();
    expect(getByText('Created')).toBeVisible();
    expect(getByText('Modified')).toBeVisible();
  });
});
