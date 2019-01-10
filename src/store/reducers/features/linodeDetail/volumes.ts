import { getLinodeVolumes } from 'src/services/linodes';
import { RequestThunk } from 'src/store/types';

// ACTIONS
const actionTypeGenerator = (s: string) => `@manager/features/linodeDetail/volumes/${s}`;

const LOAD = actionTypeGenerator('LOAD');
const SUCCESS = actionTypeGenerator('SUCCESS');
const ERROR = actionTypeGenerator('ERROR');
const UPDATE = actionTypeGenerator('UPDATE');

// STATE
type State = FeaturesState['linodeDetail']['volumes']

export const defaultState: State = {
  lastUpdated: 0,
  loading: false,
}

// ACTION CREATORS
export const load = () => ({ type: LOAD });

export const handleSuccess = (payload: Linode.Volume[]) => ({ type: SUCCESS, payload });

export const handleError = (payload: Error) => ({ type: ERROR, payload });

export const handleUpdate = (updateFn: (v: Linode.Volume[]) => Linode.Volume[]) => ({ type: UPDATE, updateFn });

// REDUCER
export default (state = defaultState, action: any) => {
  switch (action.type) {

    case LOAD:
      return { ...state, loading: true };

    case SUCCESS:
      return { ...state, loading: false, lastUpdated: Date.now(), data: action.payload };

    case ERROR:
      return { ...state, loading: false, lastUpdated: Date.now(), error: action.payload };

    case UPDATE:
      return { ...state, loading: false, lastUpdated: Date.now(), data: action.updateFn(state.data) };

    default:
      return state;
  }
};

// ASYNC
export const _getLinodeVolumes: RequestThunk<Linode.Volume[]> = (linodeId: number) => (dispatch, getState) => {
  dispatch(load());

 return getLinodeVolumes(linodeId)
    .then(({ data }) => {
      dispatch(handleSuccess(data))
      return data;
    })
    .catch(error => {
      dispatch(handleError(error))
      return error;
    });
};

// HELPERS


