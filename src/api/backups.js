import { fetch } from '~/fetch';
import { linodeBackups } from '~/api/linodes';

import { thunkFetch } from './apiActionReducerGenerator';
import { actions } from './configs/linodes';


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

export function takeBackup(id, label) {
  return async (dispatch) => {
    const result = await dispatch(thunkFetch.post(`/linode/instances/${id}/backups`, {
      label: label || undefined,
    }));

    await dispatch(linodeBackups(id));
    return result;
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
