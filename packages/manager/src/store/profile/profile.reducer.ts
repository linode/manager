import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { EntityError, RequestableData } from '../types';
import { getProfileActions, handleUpdateProfile } from './profile.actions';

export type State = RequestableData<Linode.Profile, EntityError>;

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
    /** only set loading if we don't have any data */
    const loading = state.data ? false : true;

    return { ...state, loading };
  }

  if (isType(action, getProfileActions.done)) {
    const { result } = action.payload;
    return {
      ...state,
      error: undefined,
      loading: false,
      lastUpdated: Date.now(),
      data: result
    };
  }

  if (isType(action, getProfileActions.failed)) {
    const { error } = action.payload;
    return {
      ...state,
      loading: false,
      lastUpdated: Date.now(),
      error: {
        read: error
      }
    };
  }

  if (isType(action, handleUpdateProfile.started)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, handleUpdateProfile.done)) {
    return {
      ...state,
      loading: false,
      lastUpdated: Date.now(),
      error: undefined,
      data: {
        /**
         * we can assume state.data is defined because
         * you can't update data without getting it first
         */
        ...state.data!,
        ...action.payload.result
      }
    };
  }

  if (isType(action, handleUpdateProfile.failed)) {
    return {
      ...state,
      loading: false,
      lastUpdated: Date.now(),
      error: {
        update: action.payload.error
      }
    };
  }

  return state;
};

export default reducer;
