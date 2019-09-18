import { LinodeType } from 'linode-js-sdk/lib/linodes';
import { Reducer } from 'redux';
import { EntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { getLinodeTypesActions } from './linodeType.actions';

export type State = EntityState<LinodeType>;

export const defaultState: State = {
  entities: [],
  results: [],
  error: undefined,
  loading: true,
  lastUpdated: 0
};

const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getLinodeTypesActions.started)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, getLinodeTypesActions.done)) {
    const { result } = action.payload;

    return {
      ...state,
      loading: false,
      lastUpdated: Date.now(),
      entities: result,
      results: result.map(t => t.id)
    };
  }

  if (isType(action, getLinodeTypesActions.failed)) {
    const { error } = action.payload;

    return {
      ...state,
      loading: false,
      error
    };
  }

  return state;
};

export default reducer;
