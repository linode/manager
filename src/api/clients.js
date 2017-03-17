import { fetch } from '~/fetch';
import { thunkFetch } from './apiActionReducerGenerator';

export function updateClientThumbnail(id, thumbnail) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    await fetch(token, `/account/clients/${id}/thumbnail`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/png',
      },
      body: thumbnail,
    });
  };
}

export function resetSecret(id) {
  return thunkFetch.post(`/account/clients/${id}/reset_secret`);
}
