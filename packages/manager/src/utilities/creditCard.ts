import { DateTime } from 'luxon';
import { take, takeLast } from 'ramda';
/**
 * Credit cards generally are valid through the expiry month (inclusive).
 *
 * For example,
 * A credit card with an expiry of 01/2019 expires the last day of January.
 *
 * @param expDate The expiry date in the format MM/YYYY
 */
const expirationDateFromString = (expDate: string /* MM/YYYY */) => {
  const pattern = /^((0[1-9])|(1[0-2]))\/(\d{4})$/i;
  if (!expDate || !expDate.match(pattern)) {
    throw new Error('exp date does not match MM/YYYY pattern');
  }

  // month are 1 based in luxon
  const month = +expDate.substring(0, 2);
  const year = +expDate.substring(3, 8);

  return DateTime.fromObject({ month, year }).endOf('month');
};

/**
 * Returns true if a credit card is expired.
 *
 * For example, if a card has an expiry of 1/1/2023 and the current date is
 * 1/1/2023, the card is is not expired.
 *
 * @param expDate The expiry date in the format MM/YYYY
 */
export const isCreditCardExpired = (expDate: string) => {
  return DateTime.local() > expirationDateFromString(expDate);
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

export const parseExpiryYear = (
  expiryYear: string | undefined
): string | undefined => {
  if (!expiryYear) {
    return undefined;
  }

  if (expiryYear.length > 2) {
    return expiryYear;
  }

  return take(2, String(new Date().getFullYear())) + expiryYear;
};
