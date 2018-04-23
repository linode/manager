import { createRescueDevicesPostObject } from './LinodeRescue';

describe('LinodeRescue', () => {
  describe('createRescueDevicesPostObject', () => {
    it('Returns the minumum requirement.', () => {
      const result = createRescueDevicesPostObject({});
      const expected = {
        sda: null,
        sdb: null,
        sdc: null,
        sdd: null,
        sde: null,
        sdf: null,
        sdg: null,
      };

      expect(result).toEqual(expected);
    });
    it('should provide a disk_id for a given slot when provided a valid value', () => {
      const result = createRescueDevicesPostObject({ sda: 'disk-123', sdd: 'disk-456' });
      const expected = {
        sda: { disk_id: 123 },
        sdb: null,
        sdc: null,
        sdd: { disk_id: 456 },
        sde: null,
        sdf: null,
        sdg: null,
      };

      expect(result).toEqual(expected);
    });

    it('should provide a volume_id for a given slot when provided a valid value', () => {
      const result = createRescueDevicesPostObject({ sdb: 'volume-123', sde: 'volume-456' });
      const expected = {
        sda: null,
        sdb: { volume_id: 123 },
        sdc: null,
        sdd: null,
        sde: { volume_id: 456 },
        sdf: null,
        sdg: null,
      };

      expect(result).toEqual(expected);
    });
  });
});
