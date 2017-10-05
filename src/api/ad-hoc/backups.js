import { linodeBackups } from './linodes';
import { fetch } from '../fetch';
import { actions } from '../generic/linodes';


function makeBackupAction(action) {
  return (id) => async (dispatch) => {
    const response = await dispatch(fetch.post(`/linode/instances/${id}/backups/${action}`));
    dispatch(actions.one(response, response.id));
  };
}

export const enableBackup = makeBackupAction('enable');
export const cancelBackup = makeBackupAction('cancel');

export function takeBackup(id, label) {
  return async (dispatch) => {
    const result = await dispatch(fetch.post(`/linode/instances/${id}/backups`, {
      label: label || undefined,
    }));

    await dispatch(linodeBackups(id));
    return result;
  };
}

export function restoreBackup(linodeId, targetLinode, backupId, overwrite = false) {
  return (dispatch) =>
    dispatch(fetch.post(`/linode/instances/${linodeId}/backups/${backupId}/restore`, {
      overwrite,
      linode_id: targetLinode,
    }));
}
