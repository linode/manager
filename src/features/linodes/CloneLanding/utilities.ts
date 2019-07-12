import * as moment from 'moment';
import { append, compose, flatten, map, uniqBy } from 'ramda';

/**
 * TYPES
 */

export interface CloneLandingState {
  configSelection: ConfigSelection;
  diskSelection: DiskSelection;
  selectedLinodeId: number | null;
  isSubmitting: boolean;
  errors?: Linode.ApiFieldError[];
}

// Allows for easy toggling of a selected config.
export type ConfigSelection = Record<
  number,
  { isSelected: boolean; associatedDiskIds: number[] }
>;

// Allows for easy toggling of a selected disk.
export type DiskSelection = Record<
  number,
  { isSelected: boolean; associatedConfigIds: number[] }
>;

export type CloneLandingAction =
  | { type: 'toggleConfig'; id: number }
  | { type: 'toggleDisk'; id: number }
  | { type: 'setSelectedLinodeId'; id: number }
  | { type: 'setSubmitting'; value: boolean }
  | { type: 'setErrors'; errors?: Linode.ApiFieldError[] }
  | { type: 'clearAll' };

export type ExtendedConfig = Linode.Config & { associatedDisks: Linode.Disk[] };
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
export const cloneLandingReducer = (
  state: CloneLandingState,
  action: CloneLandingAction
): CloneLandingState => {
  let id;
  switch (action.type) {
    case 'toggleConfig':
      id = action.id;
      return {
        ...state,
        configSelection: {
          ...state.configSelection,
          [id]: {
            ...state.configSelection[id],
            // This is the actual toggle:
            isSelected: !state.configSelection[id].isSelected
          }
        },
        // Clear errors on input change.
        errors: undefined
      };
    case 'toggleDisk':
      id = action.id;
      return {
        ...state,
        diskSelection: {
          ...state.diskSelection,
          // This is the actual toggle:
          [id]: {
            ...state.diskSelection[id],
            isSelected: !state.diskSelection[id].isSelected
          }
        },
        // Clear errors on input change.
        errors: undefined
      };
    case 'setSelectedLinodeId':
      id = action.id;
      return {
        ...state,
        selectedLinodeId: id,
        // Clear errors on input change.
        errors: undefined
      };
    case 'setSubmitting':
      return {
        ...state,
        isSubmitting: action.value
      };
    case 'setErrors':
      return {
        ...state,
        errors: action.errors
      };
    case 'clearAll':
      // Set all `isSelected`s to `false`, and set `selectedLinodeId` to null
      return {
        ...state,
        configSelection: map(
          config => ({ ...config, isSelected: false }),
          state.configSelection
        ),
        diskSelection: map(
          disk => ({ ...disk, isSelected: false }),
          state.diskSelection
        ),
        selectedLinodeId: null,
        errors: undefined
      };
    default:
      return state;
  }
};

export const createInitialCloneLandingState = (
  configs: Linode.Config[],
  disks: Linode.Disk[],
  preSelectedConfigId?: number,
  preSelectedDiskId?: number
): CloneLandingState => {
  const state: CloneLandingState = {
    configSelection: {},
    diskSelection: {},
    selectedLinodeId: null,
    isSubmitting: false
  };

  // Mapping of diskIds to an array of associated configIds
  const diskConfigMap: Record<number, number[]> = {};

  configs.forEach(eachConfig => {
    // We default `isSelected` to `false`, unless this config was
    // pre-selected (probably via query param).
    const isSelected = eachConfig.id === preSelectedConfigId;

    const associatedDisks = getAssociatedDisks(eachConfig, disks);
    const associatedDiskIds = associatedDisks.map(eachDisk => eachDisk.id);

    associatedDiskIds.forEach(id => {
      if (!diskConfigMap[id]) {
        diskConfigMap[id] = [];
      }
      diskConfigMap[id].push(eachConfig.id);
    });

    state.configSelection[eachConfig.id] = {
      isSelected,
      associatedDiskIds
    };
  });

  disks.forEach(eachDisk => {
    // We default `isSelected` to `false`, unless this config was
    // pre-selected (probably via query param).
    const isSelected = eachDisk.id === preSelectedDiskId;

    // Since we built the mapping earlier, we can just grab them here
    const associatedConfigIds = diskConfigMap[eachDisk.id] || [];

    state.diskSelection[eachDisk.id] = {
      isSelected,
      associatedConfigIds
    };
  });

  return state;
};

/**
 * Returns an array of Disks that are associated with a given config.
 * `config.devices` looks something like this:
 * { "sda": { "disk_id": 1234, "volume_id": 5678 }, ...etc }
 * This function returns an array of disks that match a `disk_id` in the config.
 */
export const getAssociatedDisks = (
  config: Linode.Config,
  allDisks: Linode.Disk[]
): Linode.Disk[] => {
  const disksOnConfig: number[] = [];

  // Go through the devices and grab all the disks
  Object.keys(config.devices).forEach(key => {
    if (config.devices[key] && config.devices[key].disk_id) {
      disksOnConfig.push(config.devices[key].disk_id);
    }
  });

  // Only keep the disks that were found on the config
  return allDisks.filter(eachDisk => disksOnConfig.includes(eachDisk.id));
};

// Grabs the associated disks and attaches them to each config
export const attachAssociatedDisksToConfigs = (
  configs: Linode.Config[],
  disks: Linode.Disk[]
): ExtendedConfig[] => {
  return configs.map(eachConfig => {
    const associatedDisks = getAssociatedDisks(eachConfig, disks);
    return { ...eachConfig, associatedDisks };
  });
};

export const getAllDisks = (
  configs: ExtendedConfig[],
  disks: Linode.Disk[]
): Linode.Disk[] => {
  /**
   * Get ALL disks so the estimated clone time can be calculated.
   *
   * 1. Grab associated disks from the selected CONFIGS
   * 2. Append the selected DISKS (the ones not attached to configs)
   * 3. Flatten
   * 4. There may be duplicates, so do uniqBy ID
   *
   * ...I can't believe the typing worked out for this...
   */
  const allDisks: Linode.Disk[] = compose(
    uniqBy((eachDisk: Linode.Disk) => eachDisk.id),
    flatten,
    append(disks),
    map((eachConfig: ExtendedConfig) => eachConfig.associatedDisks)
  )(configs);

  return allDisks;
};

export type EstimatedCloneTimeMode = 'sameDatacenter' | 'differentDatacenter';

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

  const humanizedEstimate = moment
    .duration(estimatedTimeInMinutes, 'minutes')
    .humanize();

  return humanizedEstimate;
};
