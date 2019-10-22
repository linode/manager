import { Action } from 'redux';
import actionCreatorFactory from 'typescript-fsa';

export interface State {
  open: boolean;
  mode: string;
  id?: number;
  domain?: string;
  origin?: Origin;
}

const actionCreator = actionCreatorFactory(`@@manager/domains`);

// ACTIONS
export const OPEN = '@manager/domains/OPEN';
export const CLOSE = '@manager/domains/CLOSE';
export const CREATING = '@manager/domains/CREATING';
export const EDITING = '@manager/domains/EDITING';
export const CLONING = '@manager/domains/CLONING';
export const RESET = '@manager/domains/RESET';

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

export const closeDrawer = (): Close => ({
  type: CLOSE
});

interface Reset extends Action {
  type: typeof RESET;
}

export const resetDrawer = (): Reset => ({
  type: RESET
});

export type Origin =
  | 'Created from Add New Menu'
  | 'Created from Domain Landing';

export const openForCreating = (origin: Origin) => createDomain({ origin });

interface CreateDomainPayload {
  origin: Origin;
}

const createDomain = actionCreator<CreateDomainPayload>(`CREAT_DOMAIN`, {
  type: CREATING
});

export const openForEditing = (domain: string, id: number): Editing => ({
  type: EDITING,
  domain,
  id
});

export const openForCloning = (domain: string, id: number): Cloning => ({
  type: CLONING,
  domain,
  id
});

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
