import { Action, AnyAction, Reducer } from 'redux';
import actionCreatorFactory, { isType } from 'typescript-fsa';

import { modes } from 'src/features/Volumes/VolumeDrawer/modes';

export interface State {
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  message?: string;
  mode: string;
  origin?: Origin;
  volumeId?: number;
  volumeLabel?: string;
  volumePath?: string;
  volumeRegion?: string;
  volumeSize?: number;
  volumeTags?: string[];
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
  type: CLOSE,
});

interface Creating extends Action {
  type: typeof CREATING;
}

interface CreatingForLinode extends Action {
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
  type: typeof CREATING_FOR_LINODE;
}

export type Origin =
  | 'Created from Add New Menu'
  | 'Created from Linode Details'
  | 'Created from Volumes Landing';

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
  mode: 'creating',
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
  message?: string;
  volumeLabel: string;
}

export const viewResizeInstructions = actionCreator<ViewResizeInstructionsPayload>(
  `VIEW_RESIZE_INSTRUCTIONS`,
  { mode: modes.VIEW_RESIZE_INSTRUCTIONS }
);

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
  volumeLabel: string;
  volumeRegion: string;
  volumeSize: number;
}

export const openForResize = (
  volumeId: number,
  volumeSize: number,
  volumeLabel: string,
  volumeRegion: string
): Resizing => ({
  type: RESIZING,
  volumeId,
  volumeLabel,
  volumeRegion,
  volumeSize,
});

interface Cloning extends Action {
  type: typeof CLONING;
  volumeId: number;
  volumeLabel: string;
  volumeRegion: string;
  volumeSize: number;
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
    volumeRegion,
    volumeSize,
  };
};
interface Attaching extends Action {
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
  type: typeof ATTACHING;
}

export const openForAttaching = (
  linodeId: number,
  linodeRegion: string,
  linodeLabel: string
): Attaching => {
  return {
    linodeId,
    linodeLabel,
    linodeRegion,
    type: ATTACHING,
  };
};

interface ViewingConfig extends Action {
  message?: string;
  type: typeof VIEWING_CONFIG;
  volumeLabel: string;
  volumePath: string;
}

export const openForConfig = (
  volumeLabel: string,
  volumePath: string,
  message?: string
): ViewingConfig => {
  return {
    message,
    type: VIEWING_CONFIG,
    volumeLabel,
    volumePath,
  };
};

export const defaultState: State = {
  mode: modes.CLOSED,
  volumeId: undefined,
  volumeLabel: undefined,
  volumeRegion: undefined,
  volumeSize: undefined,
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

export const volumeForm: Reducer<State> = (
  state = defaultState,
  action: ActionTypes
) => {
  if (isType(action, createVolume)) {
    return {
      ...state,
      mode: getMode(action),
      origin: action.payload.origin,
    };
  }

  if (isType(action, createVolumeForLinode)) {
    const {
      payload: { linodeId, linodeLabel, linodeRegion },
    } = action;

    return {
      ...state,
      linodeId,
      linodeLabel,
      linodeRegion,
      mode: getMode(action),
      origin: 'Created from Linode Details',
    };
  }

  if (isType(action, viewResizeInstructions)) {
    const {
      payload: { message, volumeLabel },
    } = action;
    return {
      ...state,
      message,
      mode: getMode(action),
      volumeLabel,
    };
  }

  switch (action.type) {
    case CLOSE:
      return {
        ...state,
        mode: modes.CLOSED,
        origin: undefined,
      };

    case CREATING_FOR_LINODE:
      return {
        ...defaultState,
        linodeId: action.linodeId,
        linodeLabel: action.linodeLabel,
        linodeRegion: action.linodeRegion,
        mode: modes.CREATING_FOR_LINODE,
      };

    case EDITING:
      return {
        ...defaultState,
        mode: modes.EDITING,
        volumeId: action.volumeId,
        volumeLabel: action.volumeLabel,
        volumeTags: action.volumeTags,
      };

    case RESIZING:
      return {
        ...defaultState,
        mode: modes.RESIZING,
        volumeId: action.volumeId,
        volumeLabel: action.volumeLabel,
        volumeRegion: action.volumeRegion,
        volumeSize: action.volumeSize,
      };

    case CLONING:
      return {
        ...defaultState,
        mode: modes.CLONING,
        volumeId: action.volumeId,
        volumeLabel: action.volumeLabel,
        volumeRegion: action.volumeRegion,
        volumeSize: action.volumeSize,
      };

    case ATTACHING:
      return {
        ...defaultState,
        linodeId: action.linodeId,
        linodeLabel: action.linodeLabel,
        linodeRegion: action.linodeRegion,
        mode: modes.ATTACHING,
      };

    case VIEWING_CONFIG:
      return {
        ...defaultState,
        message: action.message,
        mode: modes.VIEWING_CONFIG,
        volumeLabel: action.volumeLabel,
        volumePath: action.volumePath,
      };

    default:
      return state;
  }
};

export default volumeForm;
