import keyBy from 'lodash/keyBy';

import { pluralDefaultState } from '../internal';
import { UPDATE_ONE, UPDATE_ALL } from '../actions/linodeTypes';

export default function reducer(state = pluralDefaultState('linodeTypes'), action = {}) {
  switch (action.type) {
    case UPDATE_ONE:
      return {
        ...state,
        linodeTypes: {
          ...state.linodeTypes,
          [action.response.id]: action.response,
        },
      };
    case UPDATE_ALL:
      return {
        totalPages: action.response.pages,
        totalResulsts: action.response.results,
        ids: action.response.data.map(el => el.id),
        linodeTypes: keyBy(action.response.data, linodeType => linodeType.id),
      };
    default:
      return state;
  }
}
