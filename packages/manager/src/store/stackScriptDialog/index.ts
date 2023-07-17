import { Action } from 'redux';

// ACTIONS
export const OPEN = '@manager/stackScript/OPEN';
export const CLOSE = '@manager/stackScript/CLOSE';

export interface State {
  open: boolean;
  stackScriptId?: number;
}

interface Open extends Action {
  stackScriptId: number;
  type: typeof OPEN;
}

interface Close extends Action {
  type: typeof CLOSE;
}

type ActionCreator = (...args: any[]) => Action;

// ACTION CREATORS
export const openStackScriptDialog: ActionCreator = (
  stackScriptId: number
): Open => ({
  stackScriptId,
  type: OPEN,
});
export const closeStackScriptDialog: ActionCreator = (): Close => ({
  type: CLOSE,
});

// DEFAULT STATE
export const defaultState: State = {
  open: false,
};

type ActionTypes = Close | Open;

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
