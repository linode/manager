import * as React from 'react';

import { ipAddressFactory } from 'src/factories/networking';
import { renderWithTheme, resizeScreenSize } from 'src/utilities/testHelpers';

import { LinodeNetworkingActionMenu } from './LinodeNetworkingActionMenu';

import type { IPRange } from '@linode/api-v4';

describe('LinodeNetworkingActionMenu', () => {
  beforeAll(() => {
    // Set width to 1279px (< 1280px) to ensure the Action menu is visible.
    resizeScreenSize(1279);
  });

  const mockLinodeIPv4 = ipAddressFactory.buildList(1, {
    public: true,
    type: 'ipv4',
  })[0];

  const mockLinodeIPv6Range: IPRange = {
    prefix: 64,
    range: '2600:3c00:e000:0000::',
    region: 'us-west',
    route_target: '2a01:7e00::f03c:93ff:fe6e:1233',
  };

  const props = {
    isOnlyPublicIP: true,
    isVPCOnlyLinode: false,
    onEdit: vi.fn(),
    onRemove: vi.fn(),
    readOnly: false,
  };

  it('should display the correct aria-label for the IP address action menu', () => {
    const { getByRole } = renderWithTheme(
      <LinodeNetworkingActionMenu
        {...props}
        ipAddress={mockLinodeIPv4}
        ipType="Public – IPv4"
        isLinodeInterface={false}
      />
    );

    const actionMenuButton = getByRole('button');
    expect(actionMenuButton).toHaveAttribute(
      'aria-label',
      `Action menu for IP Address ${mockLinodeIPv4.address}`
    );
  });

  it('should display the correct aria-label for the IP range action menu', () => {
    const { getByRole } = renderWithTheme(
      <LinodeNetworkingActionMenu
        {...props}
        ipAddress={mockLinodeIPv6Range}
        ipType="Range – IPv6"
        isLinodeInterface={false}
      />
    );

    const actionMenuButton = getByRole('button');
    expect(actionMenuButton).toHaveAttribute(
      'aria-label',
      `Action menu for IP Address ${mockLinodeIPv6Range.range}`
    );
  });
});
