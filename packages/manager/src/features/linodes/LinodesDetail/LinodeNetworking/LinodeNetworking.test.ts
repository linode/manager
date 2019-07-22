import { ipResponse } from 'src/__data__/ipResponse';
import { uniqByIP } from './LinodeNetworking';

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
