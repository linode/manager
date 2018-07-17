export const isCreditCardExpired = (expDate: string) => {
  // MM/DDDD format
  const pattern = /^((0[1-9])|(1[0-2]))\/(\d{4})$/i;
  if (!expDate || !expDate.match(pattern)) {
    throw new Error('exp date does not match MM/YYYY pattern');
  }
  const month = +expDate.substr(0, 2);
  const year = +expDate.substr(3, 8);
  const currentMonth = new Date().getMonth() + 1; // zero index month
  const currentYear = new Date().getFullYear();
  if (year <= currentYear && month < currentMonth) {
    return true;
  }
  return false;
}