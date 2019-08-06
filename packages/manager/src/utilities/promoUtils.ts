import * as moment from 'moment';

export const expiresInDays = (time: string) => {
  if (!time) {
    return null;
  }
  return moment(time).diff(moment(), 'days');
};
