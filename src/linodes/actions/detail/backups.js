import { fetch } from '~/fetch';

export const SELECT_BACKUP = '@@linodes@@detail/backups/SELECT_BACKUP';
export const SELECT_TARGET_LINODE = '@@linodes@@detail/backups/SELECT_TARGET_LINODE';
export const SET_TIME_OF_DAY = '@@linodes@@detail/backups/SET_TIME_OF_DAY';
export const SET_DAY_OF_WEEK = '@@linodes@@detail/backups/SET_DAY_OF_WEEK';

export function selectBackup(id) {
  return { type: SELECT_BACKUP, id };
}

export function selectTargetLinode(id) {
  return { type: SELECT_TARGET_LINODE, id };
}

export function setTimeOfDay(timeOfDay) {
  return { type: SET_TIME_OF_DAY, timeOfDay };
}

export function setDayOfWeek(dayOfWeek) {
  return { type: SET_DAY_OF_WEEK, dayOfWeek };
}

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
