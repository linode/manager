import {
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVlan,
  linodeInterfaceFactoryVPC,
} from '@linode/utilities';

import { getLinodeInterfaceIPs } from './LinodeInterfaceIPs.utils';

describe('getLinodeInterfaceIPs', () => {
  it('should return VPC IPs with the primary IP first', () => {
    const linodeInterface = linodeInterfaceFactoryVPC.build({
      vpc: {
        ipv4: {
          addresses: [
            { address: '10.0.0.1' },
            {
              address: '10.0.0.2',
              primary: true,
              nat_1_1_address: '255.255.255.255',
            },
            { address: '10.0.0.3' },
          ],
          ranges: [{ range: '10.0.0.5/32' }],
        },
      },
    });

    const ips = getLinodeInterfaceIPs(linodeInterface);

    expect(ips).toStrictEqual([
      '10.0.0.2',
      '255.255.255.255 (VPC NAT)',
      '10.0.0.1',
      '10.0.0.3',
      '10.0.0.5/32 (Range)',
    ]);
  });

  it('should return Public Interface IPs with the primary IP first', () => {
    const linodeInterface = linodeInterfaceFactoryPublic.build({
      public: {
        ipv4: {
          addresses: [
            { address: '10.0.0.1' },
            {
              address: '10.0.0.2',
              primary: true,
            },
            { address: '10.0.0.3' },
          ],
        },
        ipv6: {
          ranges: [{ range: '192.168.1.0/24' }],
          shared: [],
          slaac: [{ address: '2600:3c11::f03c:93ff:fe3a:130f', prefix: '64' }],
        },
      },
    });

    const ips = getLinodeInterfaceIPs(linodeInterface);

    expect(ips).toStrictEqual([
      '10.0.0.2',
      '10.0.0.1',
      '10.0.0.3',
      '192.168.1.0/24 (Range)',
      '2600:3c11::f03c:93ff:fe3a:130f (SLAAC)',
    ]);
  });

  it('should return an empty array for VLAN without a IPAM Address', () => {
    const linodeInterface = linodeInterfaceFactoryVlan.build({
      vlan: {
        ipam_address: '',
        vlan_label: 'vlan-1',
      },
    });

    const ips = getLinodeInterfaceIPs(linodeInterface);

    expect(ips).toStrictEqual([]);
  });

  it('should return an empty with the IPAM Addresss for VLAN with an IPAM Address', () => {
    const linodeInterface = linodeInterfaceFactoryVlan.build({
      vlan: {
        ipam_address: '192.168.21.34',
        vlan_label: 'vlan-1',
      },
    });

    const ips = getLinodeInterfaceIPs(linodeInterface);

    expect(ips).toStrictEqual(['192.168.21.34 (IPAM)']);
  });
});
