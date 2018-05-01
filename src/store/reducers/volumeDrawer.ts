import { Action } from 'redux';
import { modes } from 'src/features/Volumes/VolumeDrawer';

const CLOSE = '@@manager/volumeDrawer/CLOSE';
const CREATING = '@@manager/volumeDrawer/CREATING';

interface Close extends Action {
  type: typeof CLOSE;
}

interface Creating extends Action {
  type: typeof CREATING;
}

export const close = (): Close => ({
  type: CLOSE,
});

export const openForCreating = (): Creating => {
  return ({
    type: CREATING,
  });
};

export const defaultState = {
  mode: modes.CLOSED,
  label: '',
  size: 20,
  region: 'none',
  linodeId: 0,
};

export default function volumeDrawer(state = defaultState, action: Close | Creating) {
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
    default:
      return state;
  }
}
