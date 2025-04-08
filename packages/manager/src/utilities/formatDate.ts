import { getUserTimezone } from '@linode/utilities';
import { DateTime, Duration } from 'luxon';

import { DATETIME_DISPLAY_FORMAT, ISO_DATE_FORMAT } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { parseAPIDate } from 'src/utilities/date';

export type TimeInterval = 'day' | 'month' | 'never' | 'week' | 'year';

const durationMap = {
  day: () => Duration.fromObject({ days: 1 }),
  month: () => Duration.fromObject({ months: 1 }),
  never: () => Duration.fromObject({ years: 1000 }),
  week: () => Duration.fromObject({ weeks: 1 }),
  year: () => Duration.fromObject({ years: 1 }),
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
  displayTime?: boolean;
  format?: string;
  humanizeCutoff?: TimeInterval;
  timezone?: string;
}
/**
 *
 * @param date SQL Date Format
 * @param options
 */
export const formatDate = (
  date: number | string,
  options: FormatDateOptions = {}
): string => {
  const userTimezone = getUserTimezone(options.timezone);
  const time = parseAPIDate(date).setZone(userTimezone);
  // Default to including time in the output. Hide the time if options.displayTime === false
  const defaultFormat =
    options.displayTime !== false ? DATETIME_DISPLAY_FORMAT : ISO_DATE_FORMAT;
  const expectedFormat = options.format || defaultFormat;
  const now = DateTime.local();
  const isFewSecondsAgo = time.plus({ seconds: 30 }) > now && time <= now;
  const formattedTime = shouldHumanize(time, options.humanizeCutoff)
    ? isFewSecondsAgo
      ? 'a few seconds ago'
      : time.toRelative()
    : time.toFormat(expectedFormat);

  return formattedTime ?? time.toFormat(expectedFormat);
};

export const formatDateISO = (date: string) => {
  let time;

  try {
    // Unknown error was causing this to crash in rare situations.
    time = parseAPIDate(date);
  } catch (e) {
    // Better to return a blank date than an error or incorrect information.
    reportException(e);
    return 'Error parsing date';
  }

  return time.toISO();
};
