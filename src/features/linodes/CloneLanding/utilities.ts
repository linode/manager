import { map } from 'ramda';

/**
 * Returns an array of Disks that are associated with a given config.
 * `config.devices` looks something like this:
 * { "sda": { "disk_id": 1234, "volume_id": 5678 }, ...etc }
 * This function returns an array of disks that match a `disk_id` in the config.
 */
export const getAssociatedDisks = (
  config: Linode.Config,
  disks: Linode.Disk[]
): Linode.Disk[] => {
  const disksOnConfig: number[] = [];
  Object.keys(config.devices).forEach(key => {
    if (config.devices[key] && config.devices[key].disk_id) {
      disksOnConfig.push(config.devices[key].disk_id);
    }
  });
  return disks.filter(eachDisk => disksOnConfig.includes(eachDisk.id));
};

export type ConfigSelection = Record<
  number,
  { isSelected: boolean; associatedDisks: Linode.Disk[] }
>;

export type DiskSelection = Record<
  number,
  { isSelected: boolean; configId?: number }
>;

export type ExtendedConfig = Linode.Config & { associatedDisks: Linode.Disk[] };
export type ExtendedDisk = Linode.Disk & { configId?: number };

interface State {
  configSelection: ConfigSelection;
  diskSelection: DiskSelection;
  selectedLinodeId: number | null;
}

export type Action =
  | { type: 'toggleConfig'; id: number }
  | { type: 'toggleDisk'; id: number }
  | { type: 'setSelectedLinodeId'; id: number }
  | { type: 'clearAll' };

export const cloneLandingReducer = (state: State, action: Action): State => {
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
            isSelected: !state.configSelection[id].isSelected
          }
        }
      };
    case 'toggleDisk':
      id = action.id;
      return {
        ...state,
        diskSelection: {
          ...state.diskSelection,
          [id]: {
            ...state.diskSelection[id],
            isSelected: !state.diskSelection[id].isSelected
          }
        }
      };
    case 'setSelectedLinodeId':
      id = action.id;
      return {
        ...state,
        selectedLinodeId: id
      };
    case 'clearAll':
      return {
        configSelection: map(
          config => ({ ...config, isSelected: false }),
          state.configSelection
        ),
        diskSelection: map(
          disk => ({ ...disk, isSelected: false }),
          state.diskSelection
        ),
        selectedLinodeId: null
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
): State => {
  const state: State = {
    configSelection: {},
    diskSelection: {},
    selectedLinodeId: null
  };

  const diskConfigMap = {};

  configs.forEach(eachConfig => {
    const isSelected = eachConfig.id === preSelectedConfigId;
    const associatedDisks = getAssociatedDisks(eachConfig, disks);

    associatedDisks.forEach(eachDisk => {
      diskConfigMap[eachDisk.id] = eachConfig.id;
    });

    return (state.configSelection[eachConfig.id] = {
      isSelected,
      associatedDisks
    });
  });

  disks.forEach(eachDisk => {
    const isSelected = eachDisk.id === preSelectedDiskId;

    const configId = diskConfigMap[eachDisk.id];

    return (state.diskSelection[eachDisk.id] = {
      isSelected,
      configId
    });
  });

  return state;
};

export const addConfigIdToDisks = (
  disks: Linode.Disk[],
  diskSelection: DiskSelection
): ExtendedDisk[] =>
  disks.map(eachDisk => ({
    ...eachDisk,
    configId: diskSelection[eachDisk.id].configId
  }));
