import { getInterfacePayload } from './LinodeCreateContainer';

describe('Linode Create container', () => {
  describe('interface payload helper method', () => {
    it('should handle a single VLAN correctly', () => {
      const ids = [1];
      const payload = getInterfacePayload(ids);
      expect(payload).toEqual({
        eth0: { type: 'default' },
        eth1: { type: 'additional', vlan_id: ids[0] },
      });
    });

    it('should handle multiple VLANs correctly', () => {
      const ids = [1, 2, 3];
      const payload = getInterfacePayload(ids);
      expect(payload).toEqual({
        eth0: { type: 'default' },
        eth1: { type: 'additional', vlan_id: ids[0] },
        eth2: { type: 'additional', vlan_id: ids[1] },
        eth3: { type: 'additional', vlan_id: ids[2] },
      });
    });
  });
});
