// TYPES
interface State {
  backupsCTA: boolean;
}

interface Action {
  type: string;
  error?: Error;
  data?: any;
}

type ActionCreator = (...args: any[]) => Action;

// ACTIONS
export const SET_CTA = '@manager/sidebar/SET'
export const CLEAR_CTA = '@manager/sidebar/CLEAR'

// ACTION CREATORS
export const addBackupsToSidebar: ActionCreator = () => ({ type: SET_CTA });

export const clearSidebar: ActionCreator = () => ({ type: CLEAR_CTA });

// DEFAULT STATE
export const defaultState: State = {
  backupsCTA: false,
};

// REDUCER
export default (state: State = defaultState, action: Action) => {
  switch (action.type) {
    case SET_CTA:
      return { backupsCTA: true};

    case CLEAR_CTA:
      return { backupsCTA: false } ;

    default:
      return state;
  }
};

