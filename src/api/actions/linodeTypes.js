export const UPDATE_ONE = 'linode/linodeTypes/UPDATE_ONE';
export const UPDATE_ALL = 'linode/linodeTypes/UPDATE_ALL';

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
