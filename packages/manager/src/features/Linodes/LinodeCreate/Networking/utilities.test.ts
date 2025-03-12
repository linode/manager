import { linodeInterfaceFactoryPublic } from '@linode/utilities';

import { getLinodeInterfacePayload } from './utilities';

describe('Linode Create Networking Utilities', () => {
  describe('getLinodeInterfacesPayload', () => {
    it('only retains the field of the given interface type', () => {
      const networkInterface = {
        ...linodeInterfaceFactoryPublic.build({
          public: {
            ipv4: {
              addresses: [
                {
                  address: '10.0.0.0',
                  primary: true,
                },
              ],
            },
            ipv6: {
              ranges: [],
            },
          },
          vlan: {
            ipam_address: '192.168.0.1',
            vlan_label: 'vlan-interface',
          },
          vpc: {
            ipv4: {
              addresses: [
                {
                  address: '10.0.0.0',
                  primary: true,
                },
              ],
              ranges: [],
            },
            subnet_id: 1,
            vpc_id: 1,
          },
        }),
        purpose: 'public' as const,
      };

      expect(getLinodeInterfacePayload(networkInterface)).toEqual({
        ...networkInterface,
        vlan: null,
        vpc: null,
      });
    });
  });
});
