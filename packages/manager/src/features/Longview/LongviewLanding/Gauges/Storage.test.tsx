import { sumStorage } from '../../shared/utilities';

import type { Disk } from '../../request.types';

describe('Storage Gauge', () => {
  describe('sumStorage', () => {
    const storageData: Record<string, Disk> = {
      '/dev/sda': {
        childof: 0,
        children: 0,
        dm: 0,
        fs: {
          free: [{ x: 0, y: 1 }],
          ifree: [],
          itotal: [],
          path: '/',
          total: [{ x: 0, y: 2 }],
        },
        isswap: 0,
        mounted: 1,
      },
    };
    it('returns `free` and `total` for one disk', () => {
      expect(sumStorage(storageData).free).toBe(1);
      expect(sumStorage(storageData).total).toBe(2);
    });
    it('sums `free` and `total` for multiple disks', () => {
      const data = {
        ...storageData,
        '/dev/sda2': {
          childof: 0,
          children: 0,
          dm: 0,
          fs: {
            free: [{ x: 0, y: 100 }],
            ifree: [],
            itotal: [],
            path: '/',
            total: [{ x: 0, y: 200 }],
          },
          isswap: 0,
          mounted: 1,
        },
      };
      expect(sumStorage(data).free).toBe(101);
      expect(sumStorage(data).total).toBe(202);
    });
    it('returns 0 if data is malformed', () => {
      const emptyData = { free: 0, total: 0 };
      expect(sumStorage({})).toEqual(emptyData);
      expect(sumStorage({ '/dev/sda': {} as any })).toEqual(emptyData);
      expect(sumStorage({ '/dev/sda': { fs: undefined } as any })).toEqual(
        emptyData
      );
      expect(sumStorage({ '/dev/sda': { fs: null } as any })).toEqual(
        emptyData
      );
      expect(sumStorage({ '/dev/sda': { fs: [] } as any })).toEqual(emptyData);
    });
  });
});
