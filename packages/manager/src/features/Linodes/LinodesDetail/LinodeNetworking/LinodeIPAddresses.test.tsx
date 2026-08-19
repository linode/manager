import { linodeInterfaceFactoryVPC } from '@linode/utilities';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ipAddressFactory } from 'src/factories/networking';
import { vpcIPv4Factory, vpcIPv6Factory } from 'src/factories/vpcs';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeIPAddresses } from './LinodeIPAddresses';
import { listIPv6InRange } from './LinodeIPAddressRow';
import { createType, ipResponseToDisplayRows } from './utils';

import type { LinodeIPsResponse } from '@linode/api-v4/lib/linodes';
const loadingTestId = 'circle-progress';
const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      update_linode: true,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

beforeAll(() => mockMatchMedia());
describe('listIPv6InRange utility function', () => {
  const ipv4List = ipAddressFactory.buildList(4);
  const ipv6Range = ipAddressFactory.build({
    address: '2600:3c03:e000:3cb::2',
    rdns: 'my-site.com',
    type: 'ipv6/range',
  });
  it('returns IPs within the given range', () => {
    expect(
      listIPv6InRange('2600:3c03:e000:3cb::', 64, [...ipv4List, ipv6Range])
    ).toHaveLength(1);
  });
  it('returns an empty array if no IPs fall within the range', () => {
    const outOfRangeIP = ipAddressFactory.build({
      address: '0000::',
      rdns: 'my-site.com',
      type: 'ipv6/range',
    });
    expect(
      listIPv6InRange('2600:3c03:e000:3cb::', 64, [...ipv4List, outOfRangeIP])
    ).toHaveLength(0);
  });
  it('allows pools', () => {
    const ipv6Pool = ipAddressFactory.build({
      address: '2600:3c03::e1:5000',
      rdns: 'my-site.com',
      type: 'ipv6/pool',
    });
    expect(
      listIPv6InRange('2600:3c03::e1:5000', 64, [...ipv4List, ipv6Pool])
    ).toHaveLength(1);
  });
});

describe('ipResponseToDisplayRows utility function', () => {
  const response: LinodeIPsResponse = {
    ipv4: {
      private: ipAddressFactory.buildList(1, { public: false, type: 'ipv4' }),
      public: ipAddressFactory.buildList(1, { public: true, type: 'ipv4' }),
      reserved: ipAddressFactory.buildList(1),
      shared: ipAddressFactory.buildList(1),
      vpc: [vpcIPv4Factory.build()],
    },
    ipv6: {
      global: [
        {
          prefix: 64,
          range: '2600:3c00:e000:0000::',
          region: 'us-west',
          route_target: '2a01:7e00::f03c:93ff:fe6e:1233',
        },
      ],
      link_local: ipAddressFactory.build({ type: 'ipv6' }),
      slaac: ipAddressFactory.build({ type: 'ipv6' }),
      vpc: [vpcIPv6Factory.build()],
    },
  };

  it('returns a display row for each IP/range', () => {
    const result = ipResponseToDisplayRows({
      ipResponse: response,
      isLinodeInterface: false,
    });
    expect(result).toHaveLength(10);
  });

  it('includes the meta _ip field for IP addresses', () => {
    const result = ipResponseToDisplayRows({
      ipResponse: response,
      isLinodeInterface: false,
    });
    // Check the first six rows (the IPs)
    for (let i = 0; i < 5; i++) {
      expect(result[i]._ip).toBeDefined();
    }
  });

  it('includes the meta _range field for IP ranges', () => {
    const result = ipResponseToDisplayRows({
      ipResponse: response,
      isLinodeInterface: false,
    });
    // Check the last row (the IPv6 range)
    expect(result[9]._range).toBeDefined();
  });

  it('labels RDMA VPC IPv4 rows correctly', () => {
    const result = ipResponseToDisplayRows({
      interfaceWithVPC: linodeInterfaceFactoryVPC.build({
        vpc: null,
        rdma_vpc: {
          ipv4: {
            addresses: [],
            ranges: [],
          },
          subnet_id: 1,
          vpc_id: 1,
        },
      }),
      ipResponse: response,
      isLinodeInterface: true,
    });

    expect(
      result.find((ipDisplay) => ipDisplay.type === 'VPC - RDMA - IPv4')
    ).toBeDefined();
  });

  it('labels each VPC IPv4 row according to the interface it actually belongs to, when the Linode has both a regular and an RDMA VPC interface', () => {
    const regularInterface = linodeInterfaceFactoryVPC.build({
      id: 1,
      rdma_vpc: null,
    });
    const rdmaInterface = linodeInterfaceFactoryVPC.build({
      id: 2,
      vpc: null,
      rdma_vpc: {
        ipv4: {
          addresses: [],
          ranges: [],
        },
        subnet_id: 2,
        vpc_id: 2,
      },
    });

    const mixedResponse: LinodeIPsResponse = {
      ...response,
      ipv4: {
        ...response.ipv4,
        vpc: [
          vpcIPv4Factory.build({
            address: '10.0.0.1',
            interface_id: regularInterface.id,
          }),
          vpcIPv4Factory.build({
            address: '10.0.0.2',
            interface_id: rdmaInterface.id,
          }),
        ],
      },
    };

    const result = ipResponseToDisplayRows({
      // Simulate the "primary" interface picked by useDetermineUnreachableIPs
      // being the regular VPC interface, while the RDMA interface is also present.
      interfaceWithVPC: regularInterface,
      ipResponse: mixedResponse,
      isLinodeInterface: true,
      linodeInterfaces: [regularInterface, rdmaInterface],
    });

    const regularVPCRow = result.find(
      (ipDisplay) => ipDisplay.address === '10.0.0.1'
    );
    const rdmaVPCRow = result.find(
      (ipDisplay) => ipDisplay.address === '10.0.0.2'
    );

    expect(regularVPCRow?.type).toBe('VPC – IPv4');
    expect(rdmaVPCRow?.type).toBe('VPC - RDMA - IPv4');
  });
});

describe('createType utility function', () => {
  it('creates the correct type for ipv4', () => {
    const publicIPv4 = ipAddressFactory.build({ public: true, type: 'ipv4' });
    const privateIPv4 = ipAddressFactory.build({ public: false, type: 'ipv4' });

    expect(createType(publicIPv4, 'Public')).toBe('Public – IPv4');
    expect(createType(privateIPv4, 'Private')).toBe('Private – IPv4');

    expect(createType(publicIPv4, 'Reserved')).toBe('Reserved IPv4 (public)');
    expect(createType(privateIPv4, 'Reserved')).toBe('Reserved IPv4 (private)');

    expect(createType(publicIPv4, 'Shared')).toBe('Shared – IPv4');
  });

  it('creates the correct type for ipv6', () => {
    const ipv6 = ipAddressFactory.build({ type: 'ipv6' });

    expect(createType(ipv6, 'SLAAC')).toBe('Public – IPv6 – SLAAC');
    expect(createType(ipv6, 'Link Local')).toBe('Link Local – IPv6');
  });
});

describe('LinodeIPAddresses', () => {
  it('should disable "Add an IP Address" button if the user does not have update_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_linode: false,
      },
    });

    const { queryByTestId } = await renderWithTheme(
      <LinodeIPAddresses linodeID={2} />
    );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

    const menuButton = screen.getByLabelText(/Linode IP Address Actions/i);
    await userEvent.click(menuButton);

    const ipTransferBtn = screen.getByTestId('Add an IP Address');
    expect(ipTransferBtn).toBeInTheDocument();
    expect(ipTransferBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Add an IP Address" button if the user has update_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_linode: true,
      },
    });

    const { queryByTestId } = await renderWithTheme(
      <LinodeIPAddresses linodeID={2} />
    );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

    const menuButton = screen.getByLabelText(/Linode IP Address Actions/i);
    await userEvent.click(menuButton);

    const ipTransferBtn = screen.getByTestId('Add an IP Address');
    expect(ipTransferBtn).toBeInTheDocument();
    expect(ipTransferBtn).not.toHaveAttribute('aria-disabled', 'true');
  });
});
