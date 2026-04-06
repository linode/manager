import { disks, extDisk2, extDisk3, extDiskCopy } from 'src/__data__/disks';
import { linodeConfig2, linodeConfigs } from 'src/__data__/linodeConfigs';

import {
  attachAssociatedDisksToConfigs,
  createConfigDiskSelection,
  getAllDisks,
  getAssociatedDisks,
  getEstimatedCloneTime,
  curriedCloneLandingReducer as reducer,
} from './utilities';

import type { CloneLandingState, ExtendedConfig } from './utilities';

describe('utilities', () => {
  describe('reducer', () => {
    const baseState: CloneLandingState = {
      configSelection: {
        1000: {
          associatedDiskIds: [],
          isSelected: true,
        },
      },
      diskSelection: {
        2000: {
          associatedConfigIds: [],
          isSelected: false,
        },
      },
      isSubmitting: false,
      selectedLinodeId: null,
    };

    it('toggles given config', () => {
      const newState = reducer(baseState, {
        id: 1000,
        type: 'toggleConfig',
      });
      expect(newState.configSelection[1000].isSelected).toBe(false);
    });

    it('toggles given disk', () => {
      const newState = reducer(baseState, {
        id: 2000,
        type: 'toggleDisk',
      });
      expect(newState.diskSelection[2000].isSelected).toBe(true);
    });

    it('sets the selectedLinodeId', () => {
      const newState = reducer(baseState, {
        id: 3000,
        type: 'setSelectedLinodeId',
      });
      expect(newState.selectedLinodeId).toBe(3000);
    });

    it('sets submitting', () => {
      const newState = reducer(baseState, {
        type: 'setSubmitting',
        value: true,
      });
      expect(newState.isSubmitting).toBe(true);
    });

    it('sets errors', () => {
      const newState = reducer(baseState, {
        errors: [{ reason: 'ERROR' }],
        type: 'setErrors',
      });
      expect(newState.errors).toEqual([{ reason: 'ERROR' }]);
    });

    it('clears all', () => {
      const state: CloneLandingState = {
        ...baseState,
        diskSelection: {
          2000: {
            associatedConfigIds: [],
            isSelected: true,
          },
        },
        errors: [{ reason: 'ERROR' }],
        selectedLinodeId: 3000,
      };

      const newState = reducer(state, {
        type: 'clearAll',
      });
      expect(newState.configSelection[1000].isSelected).toBe(false);
      expect(newState.diskSelection[2000].isSelected).toBe(false);
      expect(newState.selectedLinodeId).toBe(null);
      expect(newState.errors).toBe(undefined);
    });

    it('adds configs', () => {
      const state: CloneLandingState = { ...baseState };
      const newState = reducer(state, {
        configs: linodeConfigs,
        disks: [],
        type: 'syncConfigsDisks',
      });
      linodeConfigs.forEach((eachConfig) => {
        expect(newState.configSelection).toHaveProperty(String(eachConfig.id));
      });
    });

    it('adds disks', () => {
      const state: CloneLandingState = { ...baseState };
      const newState = reducer(state, {
        configs: [],
        disks,
        type: 'syncConfigsDisks',
      });
      disks.forEach((eachDisk) => {
        expect(newState.diskSelection).toHaveProperty(String(eachDisk.id));
      });
    });

    it('considers selected configs', () => {
      const state: CloneLandingState = {
        ...baseState,
        configSelection: {
          1234: {
            associatedDiskIds: [],
            isSelected: true,
          },
        },
      };
      const newState = reducer(state, {
        configs: [...linodeConfigs, linodeConfig2],
        disks: [],
        type: 'syncConfigsDisks',
      });
      expect(newState.configSelection['1234']).toHaveProperty(
        'isSelected',
        true
      );
    });

    it('considers selected disks', () => {
      const state: CloneLandingState = {
        ...baseState,
        diskSelection: {
          19040623: {
            associatedConfigIds: [],
            isSelected: true,
          },
        },
      };
      const newState = reducer(state, {
        configs: [],
        disks,
        type: 'syncConfigsDisks',
      });
      expect(newState.diskSelection['19040623']).toHaveProperty(
        'isSelected',
        true
      );
    });

    it('clears errors after each type of input change', () => {
      const state: CloneLandingState = {
        ...baseState,
        errors: [{ reason: 'ERROR' }],
      };
      expect(reducer(state, { id: 1000, type: 'toggleConfig' }).errors).toBe(
        undefined
      );
      expect(reducer(state, { id: 2000, type: 'toggleDisk' }).errors).toBe(
        undefined
      );
      expect(
        reducer(state, {
          id: 3000,
          type: 'setSelectedLinodeId',
        }).errors
      ).toBe(undefined);
    });
  });

  describe('createConfigDiskSelection', () => {
    it('defaults isSelected to false for each config and disk', () => {
      const state = createConfigDiskSelection(linodeConfigs, disks);
      linodeConfigs.forEach((eachConfig) => {
        expect(state.configSelection[eachConfig.id].isSelected).toBe(false);
      });

      disks.forEach((eachDisk) => {
        expect(state.diskSelection[eachDisk.id].isSelected).toBe(false);
      });
    });

    it('sets isSelected to true if pre-selected IDs are set', () => {
      const configId = linodeConfigs[0].id;
      const diskId = disks[0].id;
      const state = createConfigDiskSelection(
        linodeConfigs,
        disks,
        [configId],
        [diskId]
      );
      expect(state.configSelection[configId].isSelected).toBe(true);
      expect(state.diskSelection[diskId].isSelected).toBe(true);
    });

    it('adds associated disk and config IDs', () => {
      const state = createConfigDiskSelection(linodeConfigs, [extDisk3]);
      const configId = linodeConfigs[0].id;
      const diskId = extDisk3.id;

      expect(
        state.configSelection[configId].associatedDiskIds.includes(diskId)
      ).toBe(true);

      expect(
        state.diskSelection[diskId].associatedConfigIds.includes(configId)
      ).toBe(true);
    });

    it('works when there are no configs or disks', () => {
      const state = createConfigDiskSelection([], []);
      expect(state.configSelection).toEqual({});
      expect(state.diskSelection).toEqual({});
    });
  });

  describe('getAssociatedDisks', () => {
    const extendedConfig: ExtendedConfig = {
      ...linodeConfigs[0],
      associatedDisks: disks,
    };

    it('returns an array of disks associated with the config', () => {
      const associatedDisks = getAssociatedDisks(extendedConfig, [
        ...disks,
        extDisk3,
      ]);
      expect(associatedDisks).toHaveLength(1);
      expect(associatedDisks[0]).toEqual(extDisk3);
    });

    it('returns an empty array if no disks match', () => {
      const associatedDisks = getAssociatedDisks(extendedConfig, disks);
      expect(associatedDisks).toHaveLength(0);
    });
  });

  describe('attachAssociatedDisksToConfigs', () => {
    it('returns the same number of configs passed in', () => {
      expect(attachAssociatedDisksToConfigs(linodeConfigs, disks)).toHaveLength(
        linodeConfigs.length
      );
    });

    it('attaches disks to their associated configs', () => {
      const extendedConfigs = attachAssociatedDisksToConfigs(linodeConfigs, [
        ...disks,
        extDisk3,
      ]);
      expect(extendedConfigs[0]).toHaveProperty('associatedDisks');
      expect(extendedConfigs[0].associatedDisks).toHaveLength(1);
      expect(extendedConfigs[0].associatedDisks[0]).toEqual(extDisk3);
    });

    it("doesn't add disks to a config with no associated disks", () => {
      const extendedConfigs = attachAssociatedDisksToConfigs(
        linodeConfigs,
        disks
      );
      expect(extendedConfigs[0]).toHaveProperty('associatedDisks');
      expect(extendedConfigs[0].associatedDisks).toHaveLength(0);
    });
  });

  describe('getAllDisks', () => {
    const extendedConfig: ExtendedConfig = {
      ...linodeConfigs[0],
      associatedDisks: disks,
    };

    it('gets associated disks from configs', () => {
      const allDisks = getAllDisks([extendedConfig], disks);
      expect(allDisks).toHaveLength(2);
      expect(allDisks.map((eachDisk) => eachDisk.id)).toEqual([
        19040623, 19040624,
      ]);
    });

    it('removes duplicates', () => {
      const allDisks = getAllDisks([extendedConfig], [...disks, extDiskCopy]);
      expect(allDisks).toHaveLength(2);
      expect(allDisks.map((eachDisk) => eachDisk.id)).toEqual([
        19040623, 19040624,
      ]);
    });

    it('includes disks from second arg', () => {
      const allDisks = getAllDisks([extendedConfig], [...disks, extDisk2]);
      expect(allDisks).toHaveLength(3);
      expect(allDisks.map((eachDisk) => eachDisk.id)).toEqual([
        19040623, 19040624, 19040625,
      ]);
    });
  });

  describe('getEstimatedCloneTime', () => {
    it('gives a humanized estimate', () => {
      // 36.6 secs => 37 min
      expect(getEstimatedCloneTime(50000, 'sameDatacenter')).toBe('37 minutes');
    });

    it('gives a different result based on the DC mode', () => {
      expect(getEstimatedCloneTime(70000, 'sameDatacenter')).toBe('52 minutes');
      expect(getEstimatedCloneTime(70000, 'differentDatacenter')).toBe(
        '11 hours'
      );
    });

    it('handles edge cases', () => {
      expect(getEstimatedCloneTime(0, 'sameDatacenter')).toContain('0 seconds');
      expect(getEstimatedCloneTime(40000000, 'sameDatacenter')).toBe('20 days');
    });
  });
});
