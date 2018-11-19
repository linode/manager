// ACTIONS
export const OPEN = '@manager/domains/OPEN'
export const CLOSE = '@manager/domains/CLOSE'

type State = DomainDrawerState;

interface Action {
  type: string;
  error?: Error;
  data?: any;
}

type ActionCreator = (...args: any[]) => Action;

// ACTION CREATORS
export const handleOpen: ActionCreator = () => ({ type: OPEN });
export const handleClose: ActionCreator = () => ({ type: CLOSE });

// DEFAULT STATE
export const defaultState: State = {
  open: false,
};

export default (state: State = defaultState, action: Action) => {
  switch (action.type) {
    case OPEN:
      return { ...state, lastUpdated: Date.now(), open: true,
        error: undefined, enableErrors: [], autoEnrollError: undefined, autoEnroll: false };

    case CLOSE:
      return { ...state, lastUpdated: Date.now(), open: false, };

    default:
      return state;
  }
};