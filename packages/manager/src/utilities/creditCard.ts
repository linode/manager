import { DateTime } from 'luxon';
import { takeLast } from 'ramda';
/**
 * Expiration is the beginning of the day of the first day of the month.
 * Expiration: yyyy-MM-01 00:00:00
 */
const expirationDateFromString = (expDate: string /* MM/YYYY */) => {
  const pattern = /^((0[1-9])|(1[0-2]))\/(\d{4})$/i;
  if (!expDate || !expDate.match(pattern)) {
    throw new Error('exp date does not match MM/YYYY pattern');
  }

  // month are 1 based in luxon
  const month = +expDate.substr(0, 2);
  const year = +expDate.substr(3, 8);

  return DateTime.fromObject({ year, month, day: 1 }).endOf('month');
};

export const hasExpirationPassedFor = (today: DateTime = DateTime.local()) => (
  expDate: string /** MM/YYYY */
) => {
  return today > expirationDateFromString(expDate);
};

/**
 * Converts an expiry date in MM/YYYY to MM/YY.
 * @param expiry expiry date in form <mm/yyyy> or <mm/yy>
 * @returns that same expiry date in form <mm/yy>
 */
export const formatExpiry = (expiry: string): string => {
  const expiryData = expiry.split('/');
  return expiryData[1].length > 2
    ? `${expiryData[0]}/${takeLast(2, expiryData[1])}`
    : expiry;
};

export default hasExpirationPassedFor();
