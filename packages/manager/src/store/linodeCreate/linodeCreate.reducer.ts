import { parse } from 'querystring';
import { Reducer } from 'redux';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { CreateTypes, handleChangeCreateType } from './linodeCreate.actions';

export interface State {
  type: CreateTypes;
}

export const getInitialType = (): CreateTypes => {
  let queryParams;
  try {
    queryParams = parse(location.search.replace('?', '').toLowerCase());
  } catch (e) {
    // Broken query params shouldn't break the app, just default to fromImage
    return 'fromImage';
  }

  if (queryParams.type) {
    if (queryParams.subtype) {
      // Lowercase the subtype to make comparisons
      const normalizedSubtype =
        typeof queryParams.subtype === 'string'
          ? queryParams.subtype.toLowerCase()
          : queryParams.subtype.map(s => s.toLowerCase());

      /**
       * we have a subtype in the query string so now we need to deduce what
       * endpoint we should be POSTing to based on what is in the query params
       */
      if (normalizedSubtype.includes('community' || 'account')) {
        return 'fromStackScript';
      } else if (normalizedSubtype.includes('clone')) {
        return 'fromLinode';
      } else if (normalizedSubtype.includes('backup')) {
        return 'fromBackup';
      } else {
        return 'fromApp';
      }
    } else {
      // Lowercase the type to make comparisons
      const normalizedType =
        typeof queryParams.type === 'string'
          ? queryParams.type.toLowerCase()
          : queryParams.type.map(s => s.toLowerCase());
      /**
       * here we know we don't have a subtype in the query string
       * but we do have a type (AKA a parent tab is selected). In this case,
       * we can assume the first child tab is selected within the parent tabs
       * This is needed to determine the createType for conditional logic in the UI.
       */
      if (normalizedType.includes('one-click')) {
        return 'fromApp';
      } else if (normalizedType.includes('clone')) {
        return 'fromLinode';
      } else if (normalizedType.includes('backup')) {
        return 'fromBackup';
      } else {
        return 'fromImage';
      }
    }
  }

  /** always backup to 'fromImage' */
  return 'fromImage';
};

export const defaultState: State = {
  type: getInitialType()
};

const reducer: Reducer<State> = reducerWithInitialState(
  defaultState
).caseWithAction(handleChangeCreateType, (state, action) => {
  const { payload } = action;

  return {
    ...state,
    type: payload
  };
});

export default reducer;
