import { DateTime } from 'luxon';

export const expiresInDays = (time: string) => {
  if (!time) {
    return null;
  }
  // Adding a day here to match how the API calculates this.
  return DateTime.fromISO(time, { zone: 'utc' }).diffNow().days + 1;
};
