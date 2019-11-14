import { ipResponse } from 'src/__data__/ipResponse';
import { ipAddressFactory } from 'src/factories/networking';
import { listIPv6InRange, uniqByIP } from './LinodeNetworking';

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
});
