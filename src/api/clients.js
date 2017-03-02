import { fetch } from '~/fetch';

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
