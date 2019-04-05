/**
 * Expiration is the beginning of the day of the first day of the month.
 * Expiration: YYYY-MM-01 00:00:00
 */
const expirationDateFromString = (expDate: string /* MM/YYYY */) => {
  const pattern = /^((0[1-9])|(1[0-2]))\/(\d{4})$/i;
  if (!expDate || !expDate.match(pattern)) {
    throw new Error('exp date does not match MM/YYYY pattern');
  }

  const expiration = new Date();
  const month = +expDate.substr(0, 2) - 1;
  const year = +expDate.substr(3, 8);
  expiration.setFullYear(year, month, 1);
  expiration.setHours(0);
  expiration.setMinutes(0);
  expiration.setSeconds(0);

  return expiration;
};

export const hasExpirationPassedFor = (today: Date = new Date()) => (
  expDate: string /** MM/YYYY */
) => {
  return today >= expirationDateFromString(expDate);
};

export default hasExpirationPassedFor();
