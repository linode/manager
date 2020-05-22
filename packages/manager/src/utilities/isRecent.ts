import {DateTime} from 'luxon'

/**
 * @returns true if "time" is within in ]timeToCompare - 24H ; timeToCompare]
 * @param time ISO formatted Date
 * @param timeToCompareTo ISO formatted Date
 */
export const isRecent = (time: string, timeToCompareTo: string) => {

  const time_obj = DateTime.fromISO(time);
  const end = DateTime.fromISO(timeToCompareTo);
  const beginning = end.minus({hours:24});
  return  time_obj <= end && time_obj > beginning;
};
