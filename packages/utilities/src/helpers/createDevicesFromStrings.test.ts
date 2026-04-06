import { describe, expect, it } from 'vitest';

import { createDevicesFromStrings } from './createDevicesFromStrings';

describe('LinodeRescue', () => {
  describe('createRescueDevicesPostObject', () => {
    it('Returns the minimum requirement.', () => {
      const result = createDevicesFromStrings({});
      const expected = {};

      expect(result).toEqual(expected);
    });
    it('should provide a disk_id for a given slot when provided a valid value', () => {
      const result = createDevicesFromStrings({
        sda: 'disk-123',
        sdd: 'disk-456',
      });
      const expected = {
        sda: { disk_id: 123 },
        sdd: { disk_id: 456 },
      };

      expect(result).toEqual(expected);
    });

    it('should provide a volume_id for a given slot when provided a valid value', () => {
      const result = createDevicesFromStrings({
        sdb: 'volume-123',
        sde: 'volume-456',
      });
      const expected = {
        sdb: { volume_id: 123 },
        sde: { volume_id: 456 },
      };

      expect(result).toEqual(expected);
    });

    it('should return null for a disk that is set to None', () => {
      const result = createDevicesFromStrings({
        sda: 'none',
        sdd: 'disk-456',
      });
      const expected = {
        sdd: { disk_id: 456 },
      };
      expect(result).toEqual(expected);
    });
  });
});
