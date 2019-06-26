import { disks, extDisk2, extDiskCopy } from 'src/__data__/disks';
import { linodeConfigs } from 'src/__data__/linodeConfigs';
import {
  cloneLandingReducer,
  CloneLandingState,
  ExtendedConfig,
  getAllDisks,
  getEstimatedCloneTime
} from './utilities';

describe('utilities', () => {
  describe('reducer', () => {
    const baseState: CloneLandingState = {
      configSelection: {
        1000: {
          isSelected: true,
          associatedDiskIds: []
        }
      },
      diskSelection: {
        2000: {
          isSelected: false,
          associatedConfigIds: []
        }
      },
      isSubmitting: false,
      selectedLinodeId: null
    };

    it('toggles given config', () => {
      const newState = cloneLandingReducer(baseState, {
        type: 'toggleConfig',
        id: 1000
      });
      expect(newState.configSelection[1000].isSelected).toBe(false);
    });

    it('toggles given disk', () => {
      const newState = cloneLandingReducer(baseState, {
        type: 'toggleDisk',
        id: 2000
      });
      expect(newState.diskSelection[2000].isSelected).toBe(true);
    });

    it('sets the selectedLinodeId', () => {
      const newState = cloneLandingReducer(baseState, {
        type: 'setSelectedLinodeId',
        id: 3000
      });
      expect(newState.selectedLinodeId).toBe(3000);
    });

    it('sets submitting', () => {
      const newState = cloneLandingReducer(baseState, {
        type: 'setSubmitting',
        value: true
      });
      expect(newState.isSubmitting).toBe(true);
    });

    it('sets errors', () => {
      const newState = cloneLandingReducer(baseState, {
        type: 'setErrors',
        errors: [{ reason: 'ERROR' }]
      });
      expect(newState.errors).toEqual([{ reason: 'ERROR' }]);
    });

    it('clears all', () => {
      const state: CloneLandingState = {
        ...baseState,
        diskSelection: {
          2000: {
            isSelected: true,
            associatedConfigIds: []
          }
        },
        selectedLinodeId: 3000,
        errors: [{ reason: 'ERROR' }]
      };

      const newState = cloneLandingReducer(state, {
        type: 'clearAll'
      });
      expect(newState.configSelection[1000].isSelected).toBe(false);
      expect(newState.diskSelection[2000].isSelected).toBe(false);
      expect(newState.selectedLinodeId).toBe(null);
      expect(newState.errors).toBe(undefined);
    });

    it('clears errors after each type of input change', () => {
      const state: CloneLandingState = {
        ...baseState,
        errors: [{ reason: 'ERROR' }]
      };
      expect(
        cloneLandingReducer(state, { type: 'toggleConfig', id: 1000 }).errors
      ).toBe(undefined);
      expect(
        cloneLandingReducer(state, { type: 'toggleDisk', id: 2000 }).errors
      ).toBe(undefined);
      expect(
        cloneLandingReducer(state, { type: 'setSelectedLinodeId', id: 3000 })
          .errors
      ).toBe(undefined);
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
});
