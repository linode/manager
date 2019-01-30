import { Action } from 'redux';

// ACTIONS
export const OPEN = '@manager/domains/OPEN';
export const CLOSE = '@manager/domains/CLOSE';
export const CREATING = '@manager/domains/CREATING';
export const CLONING = '@manager/domains/CLONING';
export const RESET = '@manager/domains/RESET';

export interface State {
  open: boolean;
  mode: string;
  cloneId?: number;
  domain?: string;
}

interface Creating extends Action {
  type: typeof CREATING;
}
interface Cloning extends Action {
  type: typeof CLONING;
  cloneId: number;
  domain: string;
}

interface Close extends Action {
  type: typeof CLOSE;
}

interface Reset extends Action {
  type: typeof RESET;
}

type ActionCreator = (...args: any[]) => Action;

// ACTION CREATORS
export const openForCreating: ActionCreator = (): Creating => ({
  type: CREATING
});
export const openForCloning: ActionCreator = (
  domain: string,
  cloneId: number
): Cloning => ({
  type: CLONING,
  domain,
  cloneId
});
export const closeDrawer: ActionCreator = (): Close => ({ type: CLOSE });
export const resetDrawer: ActionCreator = (): Reset => ({ type: RESET });

// DEFAULT STATE
export const defaultState: State = {
  open: false,
  mode: CREATING
};

type ActionTypes = Creating | Cloning | Close | Reset;

export default (state: State = defaultState, action: ActionTypes) => {
  switch (action.type) {
    case CREATING:
      return { mode: CREATING, open: true };

    case CLONING:
      return {
        open: true,
        mode: CLONING,
        domain: action.domain,
        cloneId: action.cloneId
      };

    case CLOSE:
      return { ...state, open: false };

    case RESET:
      return defaultState;

    default:
      return state;
  }
};
