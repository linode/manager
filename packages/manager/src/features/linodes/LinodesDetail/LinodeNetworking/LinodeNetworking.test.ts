import { ipResponse } from 'src/__data__/ipResponse';
import { ipAddressFactory } from 'src/factories/networking';
import {
  createType,
  ipResponseToDisplayRows,
  listIPv6InRange,
  uniqByIP
} from './LinodeNetworking';
import { LinodeIPsResponse } from '@linode/api-v4/lib/linodes';

const {
  private: _privateIPs,
  public: _publicIPs,
  shared: _sharedIPs,
  reserved: _reservedIPs
} = ipResponse.ipv4;

describe('Linode Networking tab', () => {
  it('should remove duplicate values from lists of IP addresses', () => {
    expect(uniqByIP(_privateIPs)).toHaveLength(1);
    expect(uniqByIP(_publicIPs)).toHaveLength(2);
    expect(uniqByIP(_sharedIPs)).toHaveLength(2);
    expect(uniqByIP(_reservedIPs)).toHaveLength(0);
  });
});

describe('listIPv6InRange utility function', () => {
  const ipv4List = ipAddressFactory.buildList(4);
  const ipv6Range = ipAddressFactory.build({
    type: 'ipv6/range',
    address: '2600:3c03:e000:3cb::2',
    rdns: 'my-site.com'
  });
  it('returns IPs within the given range', () => {
    expect(
      listIPv6InRange('2600:3c03:e000:3cb::', 64, [...ipv4List, ipv6Range])
    ).toHaveLength(1);
  });
  it('returns an empty array if no IPs fall within the range', () => {
    const outOfRangeIP = ipAddressFactory.build({
      type: 'ipv6/range',
      address: '0000::',
      rdns: 'my-site.com'
    });
    expect(
      listIPv6InRange('2600:3c03:e000:3cb::', 64, [...ipv4List, outOfRangeIP])
    ).toHaveLength(0);
  });
  it('allows pools', () => {
    const ipv6Pool = ipAddressFactory.build({
      type: 'ipv6/pool',
      address: '2600:3c03::e1:5000',
      rdns: 'my-site.com'
    });
    expect(
      listIPv6InRange('2600:3c03::e1:5000', 64, [...ipv4List, ipv6Pool])
    ).toHaveLength(1);
  });
});

describe('ipResponseToDisplayRows utility function', () => {
  const response: LinodeIPsResponse = {
    ipv4: {
      public: ipAddressFactory.buildList(1, { type: 'ipv4', public: true }),
      private: ipAddressFactory.buildList(1, { type: 'ipv4', public: false }),
      shared: ipAddressFactory.buildList(1),
      reserved: ipAddressFactory.buildList(1)
    },
    ipv6: {
      slaac: ipAddressFactory.build({ type: 'ipv6' }),
      link_local: ipAddressFactory.build({ type: 'ipv6' }),
      global: [
        {
          range: '0:0:0:0:0::',
          prefix: 64,
          region: 'us-east',
          route_target: '0:0:0:0:0:0'
        }
      ]
    }
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
    const publicIPv4 = ipAddressFactory.build({ type: 'ipv4', public: true });
    const privateIPv4 = ipAddressFactory.build({ type: 'ipv4', public: false });

    expect(createType(publicIPv4, 'Public')).toBe('IPv4 – Public');
    expect(createType(privateIPv4, 'Private')).toBe('IPv4 – Private');

    expect(createType(publicIPv4, 'Reserved')).toBe('IPv4 – Reserved (public)');
    expect(createType(privateIPv4, 'Reserved')).toBe(
      'IPv4 – Reserved (private)'
    );

    expect(createType(publicIPv4, 'Shared')).toBe('IPv4 – Shared');
  });

  it('creates the correct type for ipv6', () => {
    const ipv6 = ipAddressFactory.build({ type: 'ipv6' });

    expect(createType(ipv6, 'SLAAC')).toBe('IPv6 – SLAAC');
    expect(createType(ipv6, 'Link Local')).toBe('IPv6 – Link Local');
  });
});
