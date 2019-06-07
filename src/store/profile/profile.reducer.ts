import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { RequestableData } from '../types';
import { getProfileActions, handleUpdate } from './profile.actions';

export type State = RequestableData<Linode.Profile>;

interface Action<T> {
  type: string;
  error?: Linode.ApiFieldError[];
  payload?: T;
}

export const defaultState: State = {
  lastUpdated: 0,
  loading: false,
  data: undefined,
  error: undefined
};

const reducer: Reducer<State> = (
  state: State = defaultState,
  action: Action<Linode.Profile>
) => {
  if (isType(action, getProfileActions.started)) {
    const {} = action.payload;
    return { ...state, loading: true };
  }

  if (isType(action, getProfileActions.done)) {
    const { result } = action.payload;
    return { ...state, loading: false, lastUpdated: Date.now(), data: result };
  }

  if (isType(action, getProfileActions.failed)) {
    const { error } = action.payload;
    return { ...state, loading: false, lastUpdated: Date.now(), error };
  }

  if (isType(action, handleUpdate)) {
    return {
      ...state,
      loading: false,
      lastUpdated: Date.now(),
      data: action.payload
    };
  }

  return state;
};

export default reducer;
