import { describe, expect, it } from 'vitest';

import { createStringsFromDevices } from './createStringsFromDevices';

describe('LinodeRescue', () => {
  describe('createRescueDevicesPostObject', () => {
    it('should return an empty object when all are null', () => {
      const result = createStringsFromDevices({
        sda: null,
        sdb: null,
        sdc: null,
        sdd: null,
        sde: null,
        sdf: null,
        sdg: null,
        sdh: null,
      });
      const expected = {};

      expect(result).toEqual(expected);
    });

    it('should return IDs prepeneded by `disk-` for disks', () => {
      const result = createStringsFromDevices({
        sda: null,
        sdb: null,
        sdc: null,
        sdd: { disk_id: 456 },
        sde: null,
        sdf: { disk_id: 123 },
        sdg: null,
        sdh: null,
      });
      const expected = { sdd: 'disk-456', sdf: 'disk-123' };

      expect(result).toEqual(expected);
    });

    it('should return IDs prepended by `volume-` for volumes', () => {
      const result = createStringsFromDevices({
        sda: null,
        sdb: { volume_id: 123 },
        sdc: null,
        sdd: null,
        sde: { volume_id: 456 },
        sdf: null,
        sdg: null,
        sdh: null,
      });
      const expected = { sdb: 'volume-123', sde: 'volume-456' };

      expect(result).toEqual(expected);
    });
  });
});
