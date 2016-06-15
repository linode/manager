export const SELECT_BACKUP = '@@linodes@@detail/backups/SELECT_BACKUP';
export const SELECT_NEW_OR_EXISTING = '@@linodes@@detail/backups/SELECT_NEW_OR_EXISTING';
export const SELECT_EXITING_LINODE = '@@linodes@@detail/backups/SELECT_EXITING_LINODE';
export const SET_TIME_OF_DAY = '@@linodes@@detail/backups/SET_TIME_OF_DAY';
export const SET_DAY_OF_WEEK = '@@linodes@@detail/backups/SET_DAY_OF_WEEK';

export function selectBackup(id) {
  return { type: SELECT_BACKUP, id };
}
