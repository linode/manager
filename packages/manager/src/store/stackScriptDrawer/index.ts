import { Action } from 'redux';

// ACTIONS
export const OPEN = '@manager/stackScript/OPEN';
export const CLOSE = '@manager/stackScript/CLOSE';

export interface State {
  open: boolean;
  stackScriptId?: number;
}

interface Open extends Action {
  type: typeof OPEN;
  stackScriptId: number;
}

interface Close extends Action {
  type: typeof CLOSE;
}

type ActionCreator = (...args: any[]) => Action;

// ACTION CREATORS
export const openStackScriptDrawer: ActionCreator = (
  stackScriptId: number
): Open => ({
  type: OPEN,
  stackScriptId
});
export const closeStackScriptDrawer: ActionCreator = (): Close => ({
  type: CLOSE
});

// DEFAULT STATE
export const defaultState: State = {
  open: false
};

type ActionTypes = Open | Close;

export default (state: State = defaultState, action: ActionTypes) => {
  switch (action.type) {
    case OPEN:
      return { open: true, stackScriptId: action.stackScriptId };

    case CLOSE:
      return { ...state, open: false };

    default:
      return state;
  }
};
