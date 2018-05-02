import { Action } from 'redux';
import { modes } from 'src/features/Volumes/VolumeDrawer';

const CLOSE = '@@manager/volumeDrawer/CLOSE';
const CREATING = '@@manager/volumeDrawer/CREATING';
const EDITING = '@@manager/volumeDrawer/EDITING';

interface Close extends Action {
  type: typeof CLOSE;
}

export const close = (): Close => ({
  type: CLOSE,
});

interface Creating extends Action {
  type: typeof CREATING;
}

export const openForCreating = (): Creating => {
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
| Editing;

export default function volumeDrawer(state = defaultState, action: ActionTypes) {
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
    case EDITING:
      return {
        volumeID: action.volumeID,
        label: action.label,
        size: action.size,
        region: action.region,
        linodeLabel: action.linodeLabel,
        mode: modes.EDITING,
      };
    default:
      return state;
  }
}
