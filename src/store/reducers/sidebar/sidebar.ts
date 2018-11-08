// TYPES
interface State {
  components: JSX.Element[];
}

interface Action {
  type: string;
  error?: Error;
  data?: any;
}

type ActionCreator = (...args: any[]) => Action;

// ACTIONS
export const SET = '@manager/sidebar/SET'
export const CLEAR = '@manager/sidebar/CLEAR'

// ACTION CREATORS
export const setSidebarComponent: ActionCreator = (data: JSX.Element[]) => ({ type: SET, data });

export const clearSidebar: ActionCreator = () => ({ type: CLEAR });

// DEFAULT STATE
export const defaultState: State = {
  components: []
};

// REDUCER
export default (state: State = defaultState, action: Action) => {
  switch (action.type) {
    case SET:
      return { components: action.data};

    case CLEAR:
      return { components: [] } ;

    default:
      return state;
  }
};

