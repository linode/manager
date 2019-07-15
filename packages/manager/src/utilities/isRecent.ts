import * as moment from 'moment';

// Returns true if "a" is within the previous 24 hours of "b"
export const isRecent = (a: string, b: string) => {
  const timeToCompare = moment.utc(a);
  const twentyFourHoursBeforeB = moment.utc(b).subtract(24, 'hours');

  return (
    timeToCompare.isBefore(moment.utc(b)) &&
    timeToCompare.isAfter(twentyFourHoursBeforeB)
  );
};
