import { Action } from 'redux';
// import actionCreatorFactory from 'typescript-fsa';

// const actionCreator = actionCreatorFactory(`@@manager/tagImportDrawer`);

const CLOSE = '@@manager/tagImportDrawer/CLOSE';
const OPEN = '@@manager/tagImportDrawer/OPEN'

interface Close extends Action {
  type: typeof CLOSE;
}

interface Open extends Action {
  type: typeof OPEN;
}

export const close = (): Close => ({
  type: CLOSE,
});

export const open = (): Open => ({
  type: OPEN,
})

export const defaultState: ApplicationState['tagImportDrawer'] = {
  open: true,
};

type ActionTypes =
  | Open
  | Close

export const tagImportDrawer = (state = defaultState, action: ActionTypes) => {
  switch (action.type) {
    case CLOSE:
      return {
        ...state,
        open: false,
      };

    case OPEN:
      return {
        ...state,
        open: true,
      };

    default:
      return state;
  }
}

export default tagImportDrawer;
