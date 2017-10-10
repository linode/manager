import { fetch, fetchFile } from '../fetch';


export function updateClientThumbnail(id, thumbnail) {
  return fetchFile.put(`/account/oauth-clients/${id}/thumbnail`, thumbnail);
}

export function resetSecret(id) {
  return fetch.post(`/account/oauth-clients/${id}/reset_secret`);
}
