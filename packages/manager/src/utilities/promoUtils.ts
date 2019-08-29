import * as moment from 'moment';

export const expiresInDays = (time: string) => {
  if (!time) {
    return null;
  }
  // Adding a day here to match how the API calculates this.
  return moment(time).diff(moment(), 'days') + 1;
};
