import { diskFactory } from 'src/factories/longviewDisks';
import { emptyState, processDiskData } from './DiskGraph';

const mockStats = [
  { x: 0, y: 1 },
  { x: 1, y: 2 },
  { x: 2, y: 3 },
];
const mockStats2 = [
  { x: 0, y: 10 },
  { x: 1, y: 10 },
  { x: 2, y: 10 },
];

describe('DiskGraph helper methods', () => {
  describe('processDiskData', () => {
    it('should handle empty data', () => {
      expect(processDiskData(undefined as any, 'kvm')).toEqual(emptyState);
    });

    it('should handle an empty Disks response', () => {
      expect(processDiskData({}, 'kvm')).toEqual(emptyState);
    });

    it('should separate out swap disk data', () => {
      const mockDisk = {
        '/dev/sdb': diskFactory.build({
          isswap: 1,
          reads: mockStats,
          writes: mockStats,
        }),
      };
      const expected = mockStats.map(i => ({ x: i.x, y: i.y * 2 }));
      const { swap, read, write } = processDiskData(mockDisk, 'kvm');
      expect(swap).toHaveLength(mockStats.length);
      // Since we're passing mockStats twice (for read and write),
      // the returned value should be the two combined, so y*2 for all values
      expect(swap).toEqual(expected);
      expect(read).toHaveLength(0);
      expect(write).toHaveLength(0);
    });

    it('should sum up all non-swap disks', () => {
      const mockDisk = {
        '/dev/sda': diskFactory.build({
          isswap: 1,
          reads: mockStats,
          writes: [],
        }),
        '/dev/sdb': diskFactory.build({
          isswap: 0,
          reads: mockStats,
          writes: mockStats,
        }),
        '/dev/sdc': diskFactory.build({
          isswap: 0,
          reads: mockStats2,
          writes: mockStats,
        }),
      };
      // Using mockStats2 for reads, so mockStats[x] + 10 for each value
      const expectedReads = mockStats.map(i => ({ x: i.x, y: i.y + 10 }));
      const expectedWrites = mockStats.map(i => ({ x: i.x, y: i.y * 2 }));
      const { swap, read, write } = processDiskData(mockDisk, 'kvm');
      expect(read).toEqual(expectedReads);
      expect(write).toEqual(expectedWrites);
      expect(swap).toEqual(mockStats);
    });

    it('should return an error if a system reports its info as openvz', () => {
      expect(processDiskData({}, 'openvz')).toHaveProperty('error');
      expect(processDiskData({}, 'openvz').error).toMatch(/disk/i);
    });

    it('should return an error if any disk has children (whatever that means)', () => {
      const mockDisk = {
        '/dev/sda': diskFactory.build(),
        '/dev/sdb': diskFactory.build({ isswap: 1 }),
        '/dev/sdc': diskFactory.build({
          childof: 1,
        }),
      };
      expect(processDiskData(mockDisk, 'kvm')).toHaveProperty('error');
      expect(processDiskData({}, 'openvz').error).toMatch(/disk/i);
    });
  });
});
