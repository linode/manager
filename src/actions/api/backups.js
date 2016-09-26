import { fetch } from '~/fetch';
import { makeFetchPage, makeFetchItem, makeFetchAll } from '~/api/store';
import { linodeConfig, UPDATE_LINODE, UPDATE_BACKUP } from './linodes';

export const fetchBackups = makeFetchPage(linodeConfig, '_backups');
export const fetchBackup = makeFetchItem(linodeConfig, '_backups');
export const fetchAllBackups = makeFetchAll(linodeConfig, fetchBackups, '_backups');

function makeBackupAction(action) {
  return (id) => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(
      token,
      `/linode/instances/${id}/backups/${action}`,
      { method: 'POST' }
    );
    const json = await response.json();
    dispatch({ type: UPDATE_LINODE, linode: json, linodes: json.id });
  };
}

export const enableBackup = makeBackupAction('enable');
export const cancelBackup = makeBackupAction('cancel');

export function takeBackup(id) {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/linode/instances/${id}/backups`, { method: 'POST' });
    const json = await response.json();
    dispatch({ type: UPDATE_BACKUP, backup: json, linodes: id });
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
