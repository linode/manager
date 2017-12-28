import { fetch } from '~/fetch';


const UPDATE_ONE = 'linode/linodeTypes/UPDATE_ONE';
const UPDATE_ALL = 'linode/linodeTypes/UPDATE_ALL';

export function updateOne(linodeType) {
  return {
    type: UPDATE_ONE,
    linodeType,
  };
}

export function updateAll(linodeTypes) {
  return {
    type: UPDATE_ALL,
    linodeTypes,
  };
}

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case UPDATE_ONE:
      return {
        ...state,
        [action.linodeType.id]: action.linodeType,
      };
    case UPDATE_ALL:
      return {
        ...action.linodeTypes,
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
    const linodeTypes = await dispatch(fetch.get('/linode/types'));
    dispatch(updateAll(linodeTypes));
  };
}
