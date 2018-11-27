import { Action } from 'redux';
import { modes } from 'src/features/Volumes/VolumeDrawer';

const CLOSE = '@@manager/volumeDrawer/CLOSE';
const CREATING = '@@manager/volumeDrawer/CREATING';
const CREATING_FOR_LINODE = '@@manager/volumeDrawer/CREATING_FOR_LINODE';
const EDITING = '@@manager/volumeDrawer/EDITING';
const RESIZING = '@@manager/volumeDrawer/RESIZING';
const CLONING = '@@manager/volumeDrawer/CLONING';
const ATTACHING = '@@manager/volumeDrawer/ATTACHING';

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
  linodeLabel: string;
  linodeRegion: string;
}

export const openForCreating: (linodeId?: number, linodeLabel?: string, linodeRegion?: string) => Creating | CreatingForLinode =
  (linodeId, linodeLabel, linodeRegion) => {
    if (linodeId && linodeLabel && linodeRegion) {
      return ({
        type: CREATING_FOR_LINODE,
        linodeId,
        linodeLabel,
        linodeRegion,
      })
    }

    return ({
      type: CREATING,
    });
  };

interface Editing extends Action {
  type: typeof EDITING;
  volumeId: number;
  volumeLabel: string;
}

export const openForEdit = (volumeId: number, volumeLabel: string): Editing =>
  ({ type: EDITING, volumeId, volumeLabel });

interface Resizing extends Action {
  type: typeof RESIZING;
  volumeId: number;
  volumeSize: number;
  volumeLabel: string;
}

export const openForResize = (volumeId: number, volumeSize: number, volumeLabel: string): Resizing =>
  ({ type: RESIZING, volumeId, volumeSize, volumeLabel });

interface Cloning extends Action {
  type: typeof CLONING;
  volumeId: number;
  volumeLabel: string;
  volumeSize: number;
  volumeRegion: string;
}

export const openForClone = (
  volumeId: number,
  volumeLabel: string,
  volumeSize: number,
  volumeRegion: string,
): Cloning => {
  return ({
    type: CLONING,
    volumeId,
    volumeLabel,
    volumeSize,
    volumeRegion,
  });
};
interface Attaching extends Action {
  type: typeof ATTACHING;
  linodeId: number;
  linodeRegion: string;
  linodeLabel: string;
}

export const openForAttaching = (
  linodeId: number,
  linodeRegion: string,
  linodeLabel: string,
): Attaching => {
  return ({
    type: ATTACHING,
    linodeId,
    linodeRegion,
    linodeLabel,
  });
};

export const defaultState: ApplicationState['volumeDrawer'] = {
  mode: modes.CLOSED,
  volumeLabel: undefined,
  volumeId: undefined,
  volumeSize: undefined,
};

type ActionTypes =
  | Attaching
  | Cloning
  | Close
  | Creating
  | CreatingForLinode
  | Editing
  | Resizing;

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
        linodeLabel: action.linodeLabel,
        linodeRegion: action.linodeRegion,
      };

    case EDITING:
      return {
        ...defaultState,
        mode: modes.EDITING,
        volumeId: action.volumeId,
        volumeLabel: action.volumeLabel,
      };

    case RESIZING:
      return {
        ...defaultState,
        mode: modes.RESIZING,
        volumeId: action.volumeId,
        volumeSize: action.volumeSize,
        volumeLabel: action.volumeLabel,
      };

    case CLONING:
      return {
        ...defaultState,
        volumeId: action.volumeId,
        volumeLabel: action.volumeLabel,
        volumeRegion: action.volumeRegion,
        volumeSize: action.volumeSize,
        mode: modes.CLONING,
      };

      case ATTACHING:
      return {
        ...defaultState,
        linodeId: action.linodeId,
        linodeRegion: action.linodeRegion,
        linodeLabel: action.linodeLabel,
        mode: modes.ATTACHING,
      };

    default:
      return state;
  }
}

export default volumeDrawer;
