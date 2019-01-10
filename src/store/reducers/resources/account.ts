import { Reducer } from 'redux';
import { getAccountInfo } from 'src/services/account';
import { RequestThunk } from 'src/store/types';
import { actionCreatorFactory, isType } from 'typescript-fsa';


/**
 * State
 */
type State = ApplicationState['__resources']['account'];

export const defaultState: State = {
  loading: false,
  error: undefined,
  lastUpdated: 0,
  data: undefined,
};


/**
 * Action Creators
 */
const actionCreator = actionCreatorFactory(`@@manager/account`);

const profileRequest = actionCreator('request');

const profileRequestSuccess = actionCreator<Linode.Account>('success');

const profileRequestFail = actionCreator<Linode.ApiFieldError[]>('fail');

export const actions = { profileRequest, profileRequestSuccess, profileRequestFail }

/**
 * Reducer
 */
const reducer: Reducer<State> = (state: State = defaultState, action) => {
  if (isType(action, profileRequest)) {
    return { ...state, loading: true }
  }

  if (isType(action, profileRequestSuccess)) {
    const { payload } = action;

    return { ...state, loading: false, data: payload, lastUpdated: Date.now() }
  }

  if (isType(action, profileRequestFail)) {
    const { payload } = action;

    return { ...state, loading: false, error: payload }
  }

  return state;
};

export default reducer;


/**
 * Async
 */
export const requestAccount: RequestThunk<Linode.Account> = () => (dispatch) => {
  dispatch(profileRequest());
  return getAccountInfo()
    .then((response) => {
      dispatch(profileRequestSuccess(response));
      return response;
    })
    .catch((err) => {
      dispatch(profileRequestFail(err));
      return err;
    });
};
