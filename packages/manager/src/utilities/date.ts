import { DateTime } from 'luxon';
import { reportException } from 'src/exceptionReporting';
/**
 * @returns a valid Luxon date if the format is API or ISO, Null if not
 * @param date date in either ISO 8606 (2019-01-02T12:34:42+00 or API format 2019-01-02 12:34:42
 */
export const parseAPIDate = (date: string | number) => {
  let date1;
  if (typeof date === 'string') {
    date1 = DateTime.fromISO(date, { zone: 'utc' });
  } else if (typeof date === 'number') {
    date1 = DateTime.fromMillis(date, { zone: 'utc' });
  }
  if (date1?.isValid) {
    return date1;
  }
  const err = new Error(`invalid date format: ${date}`);
  reportException(err);
  throw err;
};
export const isBefore = (d1: string, d2: string) => {
  const date1 = parseAPIDate(d1);
  const date2 = parseAPIDate(d2);
  return date1 < date2;
};

export const isAfter = (d1: string, d2: string) => {
  const date1 = parseAPIDate(d1);
  const date2 = parseAPIDate(d2);
  return date1 > date2;
};
