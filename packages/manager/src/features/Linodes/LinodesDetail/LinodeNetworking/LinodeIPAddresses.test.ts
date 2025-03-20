import { ipAddressFactory } from 'src/factories/networking';

import { createType, ipResponseToDisplayRows } from './LinodeIPAddresses';
import { listIPv6InRange } from './LinodeIPAddressRow';

import type { LinodeIPsResponse } from '@linode/api-v4/lib/linodes';

// @TODO Linode Interfaces - clean up test cases for IP tests once we remove feature flag

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
    const result = ipResponseToDisplayRows({
      displayIPKeyFirst: false,
      ipResponse: response,
    });
    expect(result).toHaveLength(7);
  });

  it('includes the meta _ip field for IP addresses', () => {
    const result = ipResponseToDisplayRows({
      displayIPKeyFirst: false,
      ipResponse: response,
    });
    // Check the first six rows (the IPs)
    for (let i = 0; i < 5; i++) {
      expect(result[i]._ip).toBeDefined();
    }
  });

  it('includes the meta _range field for IP ranges', () => {
    const result = ipResponseToDisplayRows({
      displayIPKeyFirst: false,
      ipResponse: response,
    });
    // Check the last row (the IPv6 range)
    expect(result[6]._range).toBeDefined();
  });
});

describe('createType utility function', () => {
  it('creates the correct type for ipv4', () => {
    const publicIPv4 = ipAddressFactory.build({ public: true, type: 'ipv4' });
    const privateIPv4 = ipAddressFactory.build({ public: false, type: 'ipv4' });

    expect(
      createType({ displayIPKeyFirst: false, ip: publicIPv4, key: 'Public' })
    ).toBe('IPv4 – Public');
    expect(
      createType({ displayIPKeyFirst: false, ip: privateIPv4, key: 'Private' })
    ).toBe('IPv4 – Private');

    expect(
      createType({ displayIPKeyFirst: false, ip: publicIPv4, key: 'Reserved' })
    ).toBe('IPv4 – Reserved (public)');
    expect(
      createType({ displayIPKeyFirst: false, ip: privateIPv4, key: 'Reserved' })
    ).toBe('IPv4 – Reserved (private)');

    expect(
      createType({ displayIPKeyFirst: false, ip: publicIPv4, key: 'Shared' })
    ).toBe('IPv4 – Shared');

    // Linode Interface changes to IP types
    expect(
      createType({ displayIPKeyFirst: true, ip: publicIPv4, key: 'Public' })
    ).toBe('Public – IPv4');
    expect(
      createType({ displayIPKeyFirst: true, ip: privateIPv4, key: 'Private' })
    ).toBe('Private – IPv4');

    expect(
      createType({ displayIPKeyFirst: true, ip: publicIPv4, key: 'Reserved' })
    ).toBe('Reserved IPv4 (public)');
    expect(
      createType({ displayIPKeyFirst: true, ip: privateIPv4, key: 'Reserved' })
    ).toBe('Reserved IPv4 (private)');

    expect(
      createType({ displayIPKeyFirst: true, ip: publicIPv4, key: 'Shared' })
    ).toBe('Shared – IPv4');
  });

  it('creates the correct type for ipv6', () => {
    const ipv6 = ipAddressFactory.build({ type: 'ipv6' });

    expect(
      createType({ displayIPKeyFirst: false, ip: ipv6, key: 'SLAAC' })
    ).toBe('IPv6 – SLAAC');
    expect(
      createType({ displayIPKeyFirst: false, ip: ipv6, key: 'Link Local' })
    ).toBe('IPv6 – Link Local');

    // Linode Interfaces related - test cases:
    expect(
      createType({ displayIPKeyFirst: true, ip: ipv6, key: 'SLAAC' })
    ).toBe('Public – SLAAC – IPv6');
    expect(
      createType({ displayIPKeyFirst: true, ip: ipv6, key: 'Link Local' })
    ).toBe('Link Local – IPv6');
  });
});
