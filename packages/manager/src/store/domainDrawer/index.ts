import { Action } from 'redux';

// ACTIONS
export const OPEN = '@manager/domains/OPEN';
export const CLOSE = '@manager/domains/CLOSE';
export const CREATING = '@manager/domains/CREATING';
export const EDITING = '@manager/domains/EDITING';
export const CLONING = '@manager/domains/CLONING';
export const RESET = '@manager/domains/RESET';

export interface State {
  open: boolean;
  mode: string;
  id?: number;
  domain?: string;
  origin?: Origin;
}

interface Creating extends Action {
  type: typeof CREATING;
  origin: Origin;
}
interface Cloning extends Action {
  type: typeof CLONING;
  id: number;
  domain: string;
}

interface Editing extends Action {
  type: typeof EDITING;
  id: number;
  domain: string;
}

interface Close extends Action {
  type: typeof CLOSE;
}

interface Reset extends Action {
  type: typeof RESET;
}

type ActionCreator = (...args: any[]) => Action;

export type Origin =
  | 'Created from Add New Menu'
  | 'Created from Domain Landing';

// ACTION CREATORS
export const openForCreating: ActionCreator = (origin: Origin): Creating => ({
  type: CREATING,
  origin
});
export const openForEditing: ActionCreator = (
  domain: string,
  id: number
): Editing => ({
  type: EDITING,
  domain,
  id
});
export const openForCloning: ActionCreator = (
  domain: string,
  id: number
): Cloning => ({
  type: CLONING,
  domain,
  id
});
export const closeDrawer: ActionCreator = (): Close => ({ type: CLOSE });
export const resetDrawer: ActionCreator = (): Reset => ({ type: RESET });

// DEFAULT STATE
export const defaultState: State = {
  open: false,
  mode: CREATING
};

type ActionTypes = Creating | Editing | Cloning | Close | Reset;

export default (state: State = defaultState, action: ActionTypes) => {
  switch (action.type) {
    case CREATING:
      return { mode: CREATING, open: true, origin: action.origin };

    case EDITING:
      return {
        open: true,
        mode: EDITING,
        domain: action.domain,
        id: action.id
      };

    case CLONING:
      return {
        open: true,
        mode: CLONING,
        domain: action.domain,
        id: action.id
      };

    case CLOSE:
      return { ...state, open: false };

    case RESET:
      return defaultState;

    default:
      return state;
  }
};
