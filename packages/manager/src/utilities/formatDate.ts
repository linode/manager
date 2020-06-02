import { DateTime, Duration } from 'luxon';
import { reportException } from 'src/exceptionReporting';

import store from 'src/store';
import { API_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { parseAPIDate } from 'src/utilities/date';
export type TimeInterval = 'day' | 'week' | 'month' | 'year' | 'never';

const durationMap = {
  day: () => Duration.fromObject({ days: 1 }),
  week: () => Duration.fromObject({ weeks: 1 }),
  month: () => Duration.fromObject({ months: 1 }),
  year: () => Duration.fromObject({ years: 1 }),
  never: () => Duration.fromObject({ years: 1000 })
};

export const shouldHumanize = (
  time: DateTime,
  cutoff?: TimeInterval
): boolean => {
  // If cutoff is not provided, use the default ISO output.
  if (!cutoff) {
    return false;
  }
  const duration = durationMap[cutoff]();
  /**
   * Humanize the date if the difference between the current date and provided date
   * is lower than the cutoff
   */
  return (
    DateTime.local().plus(duration) > time &&
    DateTime.local().minus(duration) < time
  );
};

interface FormatDateOptions {
  humanizeCutoff?: TimeInterval;
  format?: string;
}

export const formatDate = (
  date: string,
  options: FormatDateOptions = {}
): string => {
  let time;

  /** get the timezone from redux and use it as the timezone */
  const state = store.getState();
  const userTimezone = state.__resources?.profile?.data?.timezone ?? 'GMT';

  try {
    // Unknown error was causing this to crash in rare situations.
    time = parseAPIDate(date).setZone(userTimezone);
  } catch (e) {
    // Better to return a blank date than an error or incorrect information.
    reportException(e);
    return 'Error getting date';
  }

  const expectedFormat = options.format || API_DATETIME_NO_TZ_FORMAT;

  const formattedTime = shouldHumanize(time, options.humanizeCutoff)
    ? time.toRelative()
    : time.toFormat(expectedFormat);
  return formattedTime ?? DateTime.fromISO(date).toFormat(expectedFormat);
};

export default formatDate;
