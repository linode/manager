import produce from 'immer';
import { DatabaseType } from '@linode/api-v4/lib/databases';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { RequestableDataWithEntityError } from '../types';
import { getDatabaseTypesActions } from './types.actions';

export type State = RequestableDataWithEntityError<DatabaseType[]>;

export const defaultState: State = {
  loading: false,
  lastUpdated: 0,
  results: 0,
  error: {},
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  return produce(state, draft => {
    if (isType(action, getDatabaseTypesActions.started)) {
      draft.loading = true;
      draft.error.read = undefined;
    }

    if (isType(action, getDatabaseTypesActions.done)) {
      const { result } = action.payload;
      draft.loading = false;
      draft.lastUpdated = Date.now();
      draft.data = result.data;
      draft.results = result.results;
    }

    if (isType(action, getDatabaseTypesActions.failed)) {
      const { error } = action.payload;

      draft.loading = false;
      draft.error.read = error;
    }
  });
};

export default reducer;
