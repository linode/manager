import { thunkFetch, thunkFetchFile } from './apiActionReducerGenerator';

export function updateClientThumbnail(id, thumbnail) {
  return thunkFetchFile.put(`/account/oauth-clients/${id}/thumbnail`, thumbnail);
}

export function resetSecret(id) {
  return thunkFetch.post(`/account/oauth-clients/${id}/reset_secret`);
}
