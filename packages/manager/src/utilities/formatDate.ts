import { shouldHumanize } from '@akamai/compute-ui-core/datetime';
import { getUserTimezone } from '@linode/utilities';
import { DateTime } from 'luxon';

import { DATETIME_DISPLAY_FORMAT, ISO_DATE_FORMAT } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { parseAPIDate } from 'src/utilities/date';

export type TimeInterval = 'day' | 'month' | 'never' | 'week' | 'year';

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
