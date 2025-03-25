import produce from 'immer';
import { DateTime } from 'luxon';

import { isDiskDevice } from '../LinodesDetail/LinodeConfigs/ConfigRow';

import type { Config, Devices, Disk } from '@linode/api-v4/lib/linodes';
import type { APIError } from '@linode/api-v4/lib/types';

/**
 * TYPES
 */

export interface CloneLandingState {
  configSelection: ConfigSelection;
  diskSelection: DiskSelection;
  errors?: APIError[];
  isSubmitting: boolean;
  selectedLinodeId: null | number;
}

// Allows for easy toggling of a selected config.
export type ConfigSelection = Record<
  number,
  { associatedDiskIds: number[]; isSelected: boolean }
>;

// Allows for easy toggling of a selected disk.
export type DiskSelection = Record<
  number,
  { associatedConfigIds: number[]; isSelected: boolean }
>;

export type CloneLandingAction =
  | {
      configs: Config[];
      disks: Disk[];
      type: 'syncConfigsDisks';
    }
  | { errors?: APIError[]; type: 'setErrors' }
  | { id: number; type: 'setSelectedLinodeId' }
  | { id: number; type: 'toggleConfig' }
  | { id: number; type: 'toggleDisk' }
  | { type: 'clearAll' }
  | { type: 'setSubmitting'; value: boolean };

export interface ExtendedConfig extends Config {
  associatedDisks: Disk[];
}
/**
 * REDUCER
 *
 * We've got two basic options here:
 *
 * 1. Clone config profile
 * 2. Clone disk
 *
 * (and any combination of the above)
 *
 * Cloning a config profile will ALSO clone all associated disks.
 * So from the perspective of the UI, when you select a config profile,
 * we need to "select" the associated disks as well. This is not the same
 * as selecting those disks on their own though ... when disks are "selected"
 * via config profile, we want to disable them in the <Disks /> component,
 * and we display things differently in the <Details /> component.
 *
 * So we need a way to associate config profiles with their disks. Here's an
 * example of what this state shape looks like:
 *
 * ```typescript
 * const state = {
 *   configSelection: {
 *     555: {
 *       isSelected: true,
 *       associatedDisks: [777]
 *     }
 *   },
 *   diskSelection: {
 *     777: {
 *       isSelected: false,
 *       associatedConfigs: [555]
 *     }
 *   }
 * };
 * ```
 */
const cloneLandingReducer = (
  draft: CloneLandingState,
  action: CloneLandingAction
) => {
  switch (action.type) {
    case 'toggleConfig':
      // If the ID isn't in configSelection, return the state unchanged.
      if (!draft.configSelection[action.id]) {
        break;
      }

      const configSelected = draft.configSelection[action.id].isSelected;
      draft.configSelection[action.id].isSelected = !configSelected;

      // Clear errors on input change.
      draft.errors = undefined;
      break;

    case 'toggleDisk':
      // If the ID isn't in diskSelection, return the state unchanged.
      if (!draft.diskSelection[action.id]) {
        break;
      }

      const diskSelected = draft.diskSelection[action.id].isSelected;
      draft.diskSelection[action.id].isSelected = !diskSelected;

      // Clear errors on input change.
      draft.errors = undefined;
      break;

    case 'setSelectedLinodeId':
      draft.selectedLinodeId = action.id;
      draft.errors = undefined;
      break;

    case 'setSubmitting':
      draft.isSubmitting = action.value;
      break;

    case 'setErrors':
      draft.errors = action.errors;
      break;

    case 'clearAll':
      // Set all `isSelected`s to `false, and set selectedLinodeId to null
      draft.configSelection = Object.keys(draft.configSelection).reduce(
        (acc: ConfigSelection, key) => {
          acc[Number(key)] = {
            ...draft.configSelection[Number(key)],
            isSelected: false,
          };
          return acc;
        },
        {}
      );
      draft.diskSelection = Object.keys(draft.diskSelection).reduce(
        (acc: DiskSelection, key) => {
          acc[Number(key)] = {
            ...draft.diskSelection[Number(key)],
            isSelected: false,
          };
          return acc;
        },
        {}
      );
      draft.selectedLinodeId = null;
      draft.errors = undefined;
      break;

    // We're going to create new configSelection and diskSelection based on the
    // given configs and disks, and the elements already selected in the current state.
    case 'syncConfigsDisks':
      const { configs, disks } = action;

      // Grab the selected configs/disks from the current state.
      const selectedConfigIds = getSelectedIDs(draft.configSelection);
      const selectedDiskIds = getSelectedIDs(draft.diskSelection);

      const { configSelection, diskSelection } = createConfigDiskSelection(
        configs,
        disks,
        selectedConfigIds,
        selectedDiskIds
      );

      draft.configSelection = configSelection;
      draft.diskSelection = diskSelection;
      break;
  }
};

export const curriedCloneLandingReducer = produce(cloneLandingReducer);

export const defaultState: CloneLandingState = {
  configSelection: {},
  diskSelection: {},
  isSubmitting: false,
  selectedLinodeId: null,
};

// Returns an array of IDs of configs/disks that are selected.
const getSelectedIDs = (selection: ConfigSelection | DiskSelection) =>
  Object.keys(selection)
    .filter((id) => selection[+id].isSelected) // 1. Only keep keys(IDs) of elements that are selected.
    .map((id) => +id); // 2. Convert IDs to Numbers.

export const createConfigDiskSelection = (
  configs: Config[],
  disks: Disk[],
  selectedConfigIds: number[] = [], // Which configs should be selected?
  selectedDiskIds: number[] = [] // Which disks should be selected?
): { configSelection: ConfigSelection; diskSelection: DiskSelection } => {
  const configSelection: ConfigSelection = {};
  const diskSelection: DiskSelection = {};

  // Mapping of diskIds to an array of associated configIds
  const diskConfigMap: Record<number, number[]> = {};

  configs.forEach((eachConfig) => {
    // We default `isSelected` to `false`, unless this config was pre-selected.
    const isSelected = selectedConfigIds.includes(eachConfig.id);

    const associatedDisks = getAssociatedDisks(eachConfig, disks);
    const associatedDiskIds = associatedDisks.map((eachDisk) => eachDisk.id);

    associatedDiskIds.forEach((id) => {
      if (!diskConfigMap[id]) {
        diskConfigMap[id] = [];
      }
      diskConfigMap[id].push(eachConfig.id);
    });

    configSelection[eachConfig.id] = {
      associatedDiskIds,
      isSelected,
    };
  });

  disks.forEach((eachDisk) => {
    // We default `isSelected` to `false`, unless this disk was pre-selected.
    const isSelected = selectedDiskIds.includes(eachDisk.id);

    // Since we built the mapping earlier, we can just grab them here
    const associatedConfigIds = diskConfigMap[eachDisk.id] || [];

    diskSelection[eachDisk.id] = {
      associatedConfigIds,
      isSelected,
    };
  });

  return { configSelection, diskSelection };
};

/**
 * Returns an array of Disks that are associated with a given config.
 * `config.devices` looks something like this:
 * { "sda": { "disk_id": 1234, "volume_id": 5678 }, ...etc }
 * This function returns an array of disks that match a `disk_id` in the config.
 */
export const getAssociatedDisks = (
  config: Config,
  allDisks: Disk[]
): Disk[] => {
  const disksOnConfig: number[] = [];

  // Go through the devices and grab all the disks
  Object.keys(config.devices).forEach((key: keyof Devices) => {
    const device = config.devices[key];
    if (device && isDiskDevice(device) && device.disk_id) {
      disksOnConfig.push(device.disk_id);
    }
  });

  // Only keep the disks that were found on the config
  return allDisks.filter((eachDisk) => disksOnConfig.includes(eachDisk.id));
};

// Grabs the associated disks and attaches them to each config
export const attachAssociatedDisksToConfigs = (
  configs: Config[],
  disks: Disk[]
): ExtendedConfig[] => {
  return configs.map((eachConfig) => {
    const associatedDisks = getAssociatedDisks(eachConfig, disks);
    return { ...eachConfig, associatedDisks };
  });
};

export const getAllDisks = (
  configs: ExtendedConfig[],
  disks: Disk[]
): Disk[] => {
  /**
   * Get ALL disks so the estimated clone time can be calculated.
   *
   * 1. Grab associated disks from the selected CONFIGS
   * 2. Append the selected DISKS (the ones not attached to configs)
   * 3. There may be duplicates, so do uniqBy ID
   *
   * ...I can't believe the typing worked out for this...
   */
  const allDisks: Disk[] = configs.flatMap(
    (eachConfig: ExtendedConfig) => eachConfig.associatedDisks
  );

  allDisks.push(...disks);
  return allDisks.reduce(
    (acc: Disk[], item) =>
      acc.some((disk) => disk.id === item.id) ? acc : [...acc, item],
    []
  );
};

export type EstimatedCloneTimeMode = 'differentDatacenter' | 'sameDatacenter';

/**
 * Provides a rough estimate of the clone time, based on the size of the disk(s),
 * and whether or not the destination Linode is in the same DC or different DC.
 */
export const getEstimatedCloneTime = (
  sizeInMb: number,
  mode: EstimatedCloneTimeMode
) => {
  const multiplier = mode === 'sameDatacenter' ? 0.75 : 10;
  const estimatedTimeInMinutes = Math.ceil((multiplier * sizeInMb) / 1024);
  const now = DateTime.utc();
  // Here i add seconds to to avoid this issue:
  // 2020-06-03T18:40:55.375Z 2020-06-03T17:48:55.375Z should be 'in 52 minutes' but comes as in 51 minutes
  // This is because luxon sees this as 51 min, 59 secs, 999 msec
  // Adding a few seconds avoids this problem
  const then = now.plus({
    minutes: estimatedTimeInMinutes,
    seconds: estimatedTimeInMinutes > 0 ? 1 : 0, // in case less than 1 min
  });
  let humanizedEstimate = then.toRelative({ base: now });
  const prefixHumanized = 'in ';
  if (humanizedEstimate?.startsWith(prefixHumanized)) {
    humanizedEstimate = humanizedEstimate?.substring(prefixHumanized.length);
  }
  return humanizedEstimate;
};
