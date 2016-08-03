import { fetch } from '~/fetch';
import { makeFetchPage, makeFetchItem } from '~/api-store';
import { linodeConfig, UPDATE_LINODE, UPDATE_BACKUP } from './linodes';

export const fetchBackups = makeFetchPage(linodeConfig, '_backups');
export const fetchBackup = makeFetchItem(linodeConfig, '_backups');

function makeBackupAction(action) {
  return (id) => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/linodes/${id}/backups/${action}`, { method: 'POST' });
    const json = await response.json();
    dispatch({ type: UPDATE_LINODE, linode: json });
  };
}

export const enableBackup = makeBackupAction('enable');
export const cancelBackup = makeBackupAction('cancel');

export function takeBackup(id) {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/linodes/${id}/backups`, { method: 'POST' });
    const json = await response.json();
    dispatch({ type: UPDATE_BACKUP, backup: json, linodes: id });
  };
}
