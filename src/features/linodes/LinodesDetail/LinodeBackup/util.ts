import * as moment from 'moment';

export const formatBackupDate = (backupDate: string) => {
  return moment
    .utc(backupDate)
    .local()
    .fromNow();
};
