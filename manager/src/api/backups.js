import { fetch } from '~/fetch';
import { actions } from './configs/linodes';
import { linodeBackups } from '~/api/linodes';

function makeBackupAction(action) {
  return (id) => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(
      token,
      `/linode/instances/${id}/backups/${action}`,
      { method: 'POST' }
    );
    const json = await response.json();
    dispatch(actions.one(json, json.id));
  };
}

export const enableBackup = makeBackupAction('enable');
export const cancelBackup = makeBackupAction('cancel');

export function takeBackup(id) {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/linode/instances/${id}/backups`,
      { method: 'POST' });
    const json = await response.json();
    dispatch(linodeBackups(id));
    return json;
  };
}

export function restoreBackup(linodeId, targetLinode, backupId, overwrite = false) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const response = await fetch(token,
      `/linode/instances/${linodeId}/backups/${backupId}/restore`, {
        method: 'POST',
        body: JSON.stringify({ linode: targetLinode, overwrite }),
      });
    return await response.json();
  };
}
