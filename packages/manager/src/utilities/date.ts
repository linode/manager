import { DateTime } from 'luxon';
/**
 * @returns a valid Luxon date if the format is API or ISO, Null if not
 * @param date date in either ISO 8606 (2019-01-02T12:34:42+00 or API format 2019-01-02 12:34:42
 */
export const parseAPIDate = (date: string) => {
  const date1 = DateTime.fromISO(date, { zone: 'utc' });
  if (date1.isValid) {
    return date1;
  }
  throw new Error(`invalid date format: ${date}`);
};
export const isBefore = (d1: string, d2: string) => {
  return DateTime.fromISO(d1) < DateTime.fromISO(d2);
};

export const isAfter = (d1: string, d2: string) => {
  const date1 = parseAPIDate(d1);
  const date2 = parseAPIDate(d2);
  return date1 > date2;
};
