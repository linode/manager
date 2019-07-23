import { Reducer } from 'redux';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { EntityError, RequestableData } from '../types';
import {
  handleGetPreferences,
  handleUpdatePreferences
} from './preferences.actions';

export type State = RequestableData<Record<string, any>, EntityError>;

export const defaultState: State = {
  lastUpdated: 0,
  loading: false,
  data: undefined,
  error: undefined
};

const reducer: Reducer<State> = reducerWithInitialState(defaultState)
  .case(handleGetPreferences.started, state => {
    return {
      ...state,
      loading: true
      /**
       * intentionally not resetting error state here because it will cause
       * the PreferenceToggle.tsx component to re-render, causing the entire app
       * to re-render unnecessarily
       */
    };
  })
  .caseWithAction(handleGetPreferences.done, (state, action) => {
    return {
      ...state,
      loading: false,
      error: undefined,
      lastUpdated: Date.now(),
      data: action.payload.result
    };
  })
  .caseWithAction(handleGetPreferences.failed, (state, action) => {
    return {
      ...state,
      loading: false,
      lastUpdated: Date.now(),
      error: {
        read: action.payload.error
      }
    };
  })
  .case(handleUpdatePreferences.started, state => {
    return {
      ...state
      /**
       * intentionally not resetting error state here because it will cause
       * the PreferenceToggle.tsx component to re-render, causing the entire app
       * to re-render unnecessarily
       */
    };
  })
  .caseWithAction(handleUpdatePreferences.done, (state, action) => {
    return {
      ...state,
      data: action.payload.result,
      lastUpdated: Date.now(),
      loading: false,
      error: undefined
    };
  })
  .caseWithAction(handleUpdatePreferences.failed, (state, action) => {
    return {
      ...state,
      error: {
        update: action.payload.error
      },
      lastUpdated: Date.now()
    };
  })
  .default(state => state);

export default reducer;
