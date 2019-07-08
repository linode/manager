import { Action, AnyAction, Reducer } from 'redux';
import { modes } from 'src/features/Volumes/VolumeDrawer';
import actionCreatorFactory, { isType } from 'typescript-fsa';

export interface State {
  mode: string;
  volumeId?: number;
  volumeLabel?: string;
  volumeRegion?: string;
  volumeSize?: number;
  volumeTags?: string[];
  volumePath?: string;
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  message?: string;
  origin?: Origin;
}

const actionCreator = actionCreatorFactory(`@@manager/volumesDrawer`);

const CLOSE = '@@manager/volumeDrawer/CLOSE';
const CREATING = '@@manager/volumeDrawer/CREATING';
const CREATING_FOR_LINODE = '@@manager/volumeDrawer/CREATING_FOR_LINODE';
const EDITING = '@@manager/volumeDrawer/EDITING';
const RESIZING = '@@manager/volumeDrawer/RESIZING';
const CLONING = '@@manager/volumeDrawer/CLONING';
const ATTACHING = '@@manager/volumeDrawer/ATTACHING';
const VIEWING_CONFIG = '@@manager/volumeDrawer/VIEWING_CONFIG';

interface Close extends Action {
  type: typeof CLOSE;
}

export const close = (): Close => ({
  type: CLOSE
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

export type Origin = 'addNewMenu' | 'volumesLanding' | 'linodeDetails';

export interface LinodeOptions {
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
}
export const openForCreating = (
  origin: Origin,
  linodeOptions?: LinodeOptions
) => {
  if (linodeOptions) {
    const { linodeId, linodeLabel, linodeRegion } = linodeOptions;
    return createVolumeForLinode({ linodeId, linodeLabel, linodeRegion });
  }

  return createVolume({ origin });
};

interface CreateVolumePayload {
  origin: Origin;
}

const createVolume = actionCreator<CreateVolumePayload>(`CREATE_VOLUME`, {
  mode: 'creating'
});

interface CreateVolumeForLinodePayload {
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
}

const createVolumeForLinode = actionCreator<CreateVolumeForLinodePayload>(
  `CREATE_VOLUME_FOR_LINODE`,
  { mode: modes.CREATING_FOR_LINODE }
);

interface ViewResizeInstructionsPayload {
  volumeLabel: string;
  message?: string;
}

export const viewResizeInstructions = actionCreator<
  ViewResizeInstructionsPayload
>(`VIEW_RESIZE_INSTRUCTIONS`, { mode: modes.VIEW_RESIZE_INSTRUCTIONS });

interface Editing extends Action {
  type: typeof EDITING;
  volumeId: number;
  volumeLabel: string;
  volumeTags: string[];
}

export const openForEdit = (
  volumeId: number,
  volumeLabel: string,
  volumeTags: string[]
): Editing => ({ type: EDITING, volumeId, volumeLabel, volumeTags });

interface Resizing extends Action {
  type: typeof RESIZING;
  volumeId: number;
  volumeSize: number;
  volumeLabel: string;
}

export const openForResize = (
  volumeId: number,
  volumeSize: number,
  volumeLabel: string
): Resizing => ({ type: RESIZING, volumeId, volumeSize, volumeLabel });

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
  volumeRegion: string
): Cloning => {
  return {
    type: CLONING,
    volumeId,
    volumeLabel,
    volumeSize,
    volumeRegion
  };
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
  linodeLabel: string
): Attaching => {
  return {
    type: ATTACHING,
    linodeId,
    linodeRegion,
    linodeLabel
  };
};

interface ViewingConfig extends Action {
  type: typeof VIEWING_CONFIG;
  volumeLabel: string;
  volumePath: string;
  message?: string;
}

export const openForConfig = (
  volumeLabel: string,
  volumePath: string,
  message?: string
): ViewingConfig => {
  return {
    type: VIEWING_CONFIG,
    volumeLabel,
    volumePath,
    message
  };
};

export const defaultState: State = {
  mode: modes.CLOSED,
  volumeLabel: undefined,
  volumeId: undefined,
  volumeSize: undefined
};

type ActionTypes =
  | Attaching
  | Cloning
  | Close
  | Creating
  | CreatingForLinode
  | Editing
  | Resizing
  | ViewingConfig;

const getMode = (action: AnyAction) => action.meta && action.meta.mode;

export const volumeDrawer: Reducer<State> = (
  state = defaultState,
  action: ActionTypes
) => {
  if (isType(action, createVolume)) {
    return {
      ...state,
      mode: getMode(action),
      origin: action.payload.origin
    };
  }

  if (isType(action, createVolumeForLinode)) {
    const {
      payload: { linodeId, linodeLabel, linodeRegion }
    } = action;

    return {
      ...state,
      mode: getMode(action),
      origin: 'linodeDetails',
      linodeId,
      linodeLabel,
      linodeRegion
    };
  }

  if (isType(action, viewResizeInstructions)) {
    const {
      payload: { volumeLabel, message }
    } = action;
    return {
      ...state,
      mode: getMode(action),
      volumeLabel,
      message
    };
  }

  switch (action.type) {
    case CLOSE:
      return {
        ...state,
        mode: modes.CLOSED,
        origin: undefined
      };

    case CREATING_FOR_LINODE:
      return {
        ...defaultState,
        mode: modes.CREATING_FOR_LINODE,
        linodeId: action.linodeId,
        linodeLabel: action.linodeLabel,
        linodeRegion: action.linodeRegion
      };

    case EDITING:
      return {
        ...defaultState,
        mode: modes.EDITING,
        volumeId: action.volumeId,
        volumeLabel: action.volumeLabel,
        volumeTags: action.volumeTags
      };

    case RESIZING:
      return {
        ...defaultState,
        mode: modes.RESIZING,
        volumeId: action.volumeId,
        volumeSize: action.volumeSize,
        volumeLabel: action.volumeLabel
      };

    case CLONING:
      return {
        ...defaultState,
        volumeId: action.volumeId,
        volumeLabel: action.volumeLabel,
        volumeRegion: action.volumeRegion,
        volumeSize: action.volumeSize,
        mode: modes.CLONING
      };

    case ATTACHING:
      return {
        ...defaultState,
        linodeId: action.linodeId,
        linodeRegion: action.linodeRegion,
        linodeLabel: action.linodeLabel,
        mode: modes.ATTACHING
      };

    case VIEWING_CONFIG:
      return {
        ...defaultState,
        volumeLabel: action.volumeLabel,
        volumePath: action.volumePath,
        message: action.message,
        mode: modes.VIEWING_CONFIG
      };

    default:
      return state;
  }
};

export default volumeDrawer;
