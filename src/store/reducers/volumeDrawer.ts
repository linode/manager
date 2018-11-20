import { Action } from 'redux';
import { modes } from 'src/features/Volumes/VolumeDrawer';

const CLOSE = '@@manager/volumeDrawer/CLOSE';
const CREATING = '@@manager/volumeDrawer/CREATING';
const CREATING_FOR_LINODE = '@@manager/volumeDrawer/CREATING_FOR_LINODE';
const EDITING = '@@manager/volumeDrawer/EDITING';
const RESIZING = '@@manager/volumeDrawer/RESIZING';
const CLONING = '@@manager/volumeDrawer/CLONING';

interface Close extends Action {
  type: typeof CLOSE;
}

export const close = (): Close => ({
  type: CLOSE,
});

interface Creating extends Action {
  type: typeof CREATING;
}

interface CreatingForLinode extends Action {
  type: typeof CREATING_FOR_LINODE;
  linodeId: number;
}

export const openForCreating: (linodeId?: number) => Creating | CreatingForLinode =
  (linodeId?: number) => {
    if (linodeId) {
      return ({
        type: CREATING_FOR_LINODE,
        linodeId,
      })
    }

    return ({
      type: CREATING,
    });
  };

interface Editing extends Action {
  type: typeof EDITING;
  volumeID: number;
  label: string;
  size: number;
  region: string;
  linodeLabel: string;
}

export const openForEdit = (
  volumeID: number,
  label: string,
  size: number,
  region: string,
  linodeLabel: string,
): Editing => {
  return ({
    type: EDITING,
    volumeID,
    label,
    size,
    region,
    linodeLabel,
  });
};

interface Resizing extends Action {
  type: typeof RESIZING;
  volumeID: number;
  label: string;
  size: number;
  region: string;
  linodeLabel: string;
}

export const openForResize = (
  volumeID: number,
  label: string,
  size: number,
  region: string,
  linodeLabel: string,
): Resizing => {
  return ({
    type: RESIZING,
    volumeID,
    label,
    size,
    region,
    linodeLabel,
  });
};

interface Cloning extends Action {
  type: typeof CLONING;
  volumeID: number;
  label: string;
  size: number;
  region: string;
}

export const openForClone = (
  volumeID: number,
  label: string,
  size: number,
  region: string,
): Cloning => {
  return ({
    type: CLONING,
    volumeID,
    label,
    size,
    region,
  });
};

export const defaultState = {
  mode: modes.CLOSED,
  volumeID: 0,
  label: '',
  size: 20,
  region: 'none',
  linodeLabel: '',
  linodeId: 0,
};

type ActionTypes =
  Close
  | Creating
  | CreatingForLinode
  | Editing
  | Resizing
  | Cloning;

export const volumeDrawer = (state = defaultState, action: ActionTypes) => {
  switch (action.type) {
    case CLOSE:
      return {
        ...state,
        mode: modes.CLOSED,
      };

    case CREATING:
      return {
        ...defaultState,
        mode: modes.CREATING,
      };

    case CREATING_FOR_LINODE:
      return {
        ...defaultState,
        mode: modes.CREATING_FOR_LINODE,
        linodeId: action.linodeId,
      };

    case EDITING:
      return {
        ...defaultState,
        volumeID: action.volumeID,
        label: action.label,
        size: action.size,
        region: action.region,
        linodeLabel: action.linodeLabel,
        mode: modes.EDITING,
      };

    case RESIZING:
      return {
        ...defaultState,
        volumeID: action.volumeID,
        label: action.label,
        size: action.size,
        region: action.region,
        linodeLabel: action.linodeLabel,
        mode: modes.RESIZING,
      };

    case CLONING:
      return {
        ...defaultState,
        volumeID: action.volumeID,
        label: action.label,
        size: action.size,
        region: action.region,
        mode: modes.CLONING,
      };

    default:
      return state;
  }
}

export default volumeDrawer;
