import { parseAPIDate } from 'src/utilities/date';

export const expiresInDays = (time: string) => {
  if (!time) {
    return null;
  }
  // Adding a day here to match how the API calculates this.
  return parseAPIDate(time).diffNow().days + 1;
};
