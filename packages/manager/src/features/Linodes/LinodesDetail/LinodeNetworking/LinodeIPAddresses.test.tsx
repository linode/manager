import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ipAddressFactory } from 'src/factories/networking';
import {
  mockMatchMedia,
  renderWithThemeAndRouter,
} from 'src/utilities/testHelpers';

import { createType, ipResponseToDisplayRows } from './LinodeIPAddresses';
import { LinodeIPAddresses } from './LinodeIPAddresses';
import { listIPv6InRange } from './LinodeIPAddressRow';

import type { LinodeIPsResponse } from '@linode/api-v4/lib/linodes';

const loadingTestId = 'circle-progress';
const navigate = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});
const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    permissions: {
      assign_ips: false,
      allocate_linode_ip_address: false,
    },
  })),
  useNavigate: vi.fn(() => navigate),
  useFlags: vi.fn().mockReturnValue({}),
  useLinodeQuery: vi.fn().mockReturnValue({}),
}));
vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));
vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});
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
      vpc: [],
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
    },
  };

  it('returns a display row for each IP/range', () => {
    const result = ipResponseToDisplayRows(response);
    expect(result).toHaveLength(7);
  });

  it('includes the meta _ip field for IP addresses', () => {
    const result = ipResponseToDisplayRows(response);
    // Check the first six rows (the IPs)
    for (let i = 0; i < 5; i++) {
      expect(result[i]._ip).toBeDefined();
    }
  });

  it('includes the meta _range field for IP ranges', () => {
    const result = ipResponseToDisplayRows(response);
    // Check the last row (the IPv6 range)
    expect(result[6]._range).toBeDefined();
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

  it('should disable "IP Transfer" button if the user does not have assign_ips permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      permissions: {
        ...queryMocks.userPermissions().permissions,
        assign_ips: false,
      },
    });

    const { queryByTestId } = await renderWithThemeAndRouter(
      <LinodeIPAddresses linodeID={1} />
    );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

    const menuButton = screen.getByLabelText(/Linode IP Address Actions/i);
    await userEvent.click(menuButton);

    const ipTransferBtn = screen.getByTestId('IP Transfer');
    expect(ipTransferBtn).toBeInTheDocument();
    expect(ipTransferBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable "Add an IP Address" button if the user does not have allocate_linode_ip_address permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      permissions: {
        ...queryMocks.userPermissions().permissions,
        allocate_linode_ip_address: false,
      },
    });

    const { queryByTestId } = await renderWithThemeAndRouter(
      <LinodeIPAddresses linodeID={1} />
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
});
