import { fetch } from '~/fetch';

export function restoreBackup(linodeId, targetLinode, backupId, overwrite = false) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const response = await fetch(token,
      `/linodes/${linodeId}/backups/${backupId}/restore`, {
        method: 'POST',
        body: JSON.stringify({ linode: targetLinode, overwrite }),
      });
    return await response.json();
  };
}
