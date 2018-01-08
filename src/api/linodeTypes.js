import { fetch } from './fetch';
import { updateOne, updateAll } from './actions/linodeTypes';


export function getOne(id) {
  return async (dispatch) => {
    const response = await dispatch(fetch.get(`/linode/types/${id}`));
    dispatch(updateOne(response));
  };
}

export function getAll() {
  return async (dispatch) => {
    const response = await dispatch(fetch.get('/linode/types'));
    dispatch(updateAll(response));
  };
}
