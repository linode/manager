import keyBy from 'lodash/keyBy';

import { fetch } from './fetch';
import { pluralDefaultState } from './internal';


const UPDATE_ONE = 'linode/linodeTypes/UPDATE_ONE';
const UPDATE_ALL = 'linode/linodeTypes/UPDATE_ALL';

export function updateOne(response) {
  return {
    type: UPDATE_ONE,
    response,
  };
}

export function updateAll(response) {
  return {
    type: UPDATE_ALL,
    response,
  };
}

export default function reducer(state = pluralDefaultState('types'), action = {}) {
  switch (action.type) {
    case UPDATE_ONE:
      return {
        ...state,
        types: {
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

export function getOne(id) {
  return async (dispatch) => {
    const linodeType = await dispatch(fetch.get(`/linode/types/${id}`));
    dispatch(updateOne(linodeType));
  };
}

export function getAll() {
  return async (dispatch) => {
    const resp = await dispatch(fetch.get('/linode/types'));
    dispatch(updateAll(resp));
  };
}
