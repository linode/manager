import { ThunkAction } from 'redux-thunk';
import { getLinodes } from 'src/services/linodes';

// ACTIONS
const actionTypeGenerator = (s: string) => `@manager/features/linodes/${s}`;

const LOAD = actionTypeGenerator('LOAD');
const SUCCESS = actionTypeGenerator('SUCCESS');
const ERROR = actionTypeGenerator('ERROR');
const UPDATE = actionTypeGenerator('UPDATE');

// STATE
type State = FeaturesState['linodes']

export const defaultState: State = {
  lastUpdated: 0,
  loading: false,
}

// ACTION CREATORS
export const load = () => ({ type: LOAD });

export const handleSuccess = (payload: Linode.ResourcePage<Linode.Linode>) => ({ type: SUCCESS, payload });

export const handleError = (payload: Error) => ({ type: ERROR, payload });

export const handleUpdate = (payload: Linode.ResourcePage<Linode.Linode>) => ({ type: UPDATE, payload });

// REDUCER
export default (state = defaultState, action: any) => {
  switch (action.type) {

    case LOAD:
      return { ...state, loading: true, data: [] };

    case SUCCESS:
      return { ...state, loading: false, lastUpdated: Date.now(), data: action.payload };

    case ERROR:
      return { ...state, loading: false, lastUpdated: Date.now(), error: action.payload };

    case UPDATE:
      return { ...state, loading: false, lastUpdated: Date.now(), data: action.payload };

    default:
      return state;
  }
};

// ASYNC
export const _getLinodes = (params: any = {}, filter: any = {}): ThunkAction<void, State, void> => (dispatch, getState) => {
  dispatch(load());

  getLinodes(params, filter)
    .then(response => dispatch(handleSuccess(response)))
    .catch(error => dispatch(handleError(error)));
};

// HELPERS


