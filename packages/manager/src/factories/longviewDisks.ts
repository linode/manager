import * as Factory from 'factory.ts';
import { Disk, LongviewDisk } from 'src/features/Longview/request.types';

const mockStats = [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }];

export const diskFactory = Factory.Sync.makeFactory<Disk>({
  reads: mockStats,
  writes: mockStats,
  isswap: 0,
  mounted: 1,
  childof: 0,
  dm: 0,
  children: 0
});

export const longviewDiskFactory = Factory.Sync.makeFactory<LongviewDisk>({
  Disk: {
    '/dev/sda': diskFactory.build(),
    '/dev/sdb': diskFactory.build({ isswap: 1 })
  }
});
