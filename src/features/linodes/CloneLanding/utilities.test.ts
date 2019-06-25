import { disks, extDisk2, extDiskCopy } from 'src/__data__/disks';
import { linodeConfigs } from 'src/__data__/linodeConfigs';
import {
  ExtendedConfig,
  getAllDisks,
  getEstimatedCloneTime
} from './utilities';

describe('utilities', () => {
  describe('getEstimatedCloneTime', () => {
    it('gives a humanized estimate', () => {
      expect(getEstimatedCloneTime(50000, 'sameDatacenter')).toBe('37 minutes');
    });

    it('gives a different result based on the DC mode', () => {
      expect(getEstimatedCloneTime(70000, 'sameDatacenter')).toBe('an hour');
      expect(getEstimatedCloneTime(70000, 'differentDatacenter')).toBe(
        '11 hours'
      );
    });

    it('handles edge cases', () => {
      expect(getEstimatedCloneTime(0, 'sameDatacenter')).toBe('a few seconds');
      expect(getEstimatedCloneTime(40000000, 'sameDatacenter')).toBe('20 days');
    });
  });

  describe('getAllDisks', () => {
    const extendedConfig: ExtendedConfig = {
      ...linodeConfigs[0],
      associatedDisks: disks
    };

    it('gets associated disks from configs', () => {
      const allDisks = getAllDisks([extendedConfig], disks);
      expect(allDisks).toHaveLength(2);
      expect(allDisks.map(eachDisk => eachDisk.id)).toEqual([
        19040623,
        19040624
      ]);
    });

    it('removes duplicates', () => {
      const allDisks = getAllDisks([extendedConfig], [...disks, extDiskCopy]);
      expect(allDisks).toHaveLength(2);
      expect(allDisks.map(eachDisk => eachDisk.id)).toEqual([
        19040623,
        19040624
      ]);
    });

    it('includes disks from second arg', () => {
      const allDisks = getAllDisks([extendedConfig], [...disks, extDisk2]);
      expect(allDisks).toHaveLength(3);
      expect(allDisks.map(eachDisk => eachDisk.id)).toEqual([
        19040623,
        19040624,
        19040625
      ]);
    });
  });
});
