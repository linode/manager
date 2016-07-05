import { fetch } from '~/fetch';
import {
  makeFetchPage,
  makeUpdateItem,
  makeUpdateUntil,
} from '~/api-store';

export const UPDATE_BACKUPS = '@@backups/UPDATE_BACKUPS';
export const UPDATE_BACKUP = '@@backups/UPDATE_BACKUP';

export const fetchbBackups = makeFetchPage(UPDATE_BACKUPS, 'backups');
export const updateBackup = makeUpdateItem(UPDATE_BACKUP, 'backups', 'backup');
export const updateBackupUntil = makeUpdateUntil(UPDATE_BACKUP, 'backups', 'backup');


function backupAction(id, action, linode = undefined) {
  return id => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const param = {action == 'restore' ? `?linode=${linode}` : ''}
    const response =  fetch(token, `/linodes/${id}/backups/${action}${param}`, { method: 'POST' });
    const json = await response.json();
    dispatch({ type: UPDATE_BACKUP, backup: json });
  };
}

export function enableBackup(id) {
  return backupAction(id, 'enable');
}

export function cancelBackup(id) {
  return backupAction(id, 'cancel');
}

export function restoreBackup(id, linode) {
  return backupAction(id, 'restore', linode);
}
