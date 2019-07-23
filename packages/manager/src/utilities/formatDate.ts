import * as moment from 'moment-timezone';
import { pathOr } from 'ramda';

import { ISO_FORMAT } from 'src/constants';
import { reportException } from 'src/exceptionReporting';

import store from 'src/store';

export type TimeInterval = 'day' | 'week' | 'month' | 'year' | 'never';

const durationMap = {
  day: () => moment.duration(1, 'days'),
  week: () => moment.duration(1, 'weeks'),
  month: () => moment.duration(1, 'months'),
  year: () => moment.duration(1, 'years'),
  never: () => moment.duration(1000, 'years')
};

export const shouldHumanize = (
  time: moment.Moment,
  cutoff?: TimeInterval
): boolean => {
  // If cutoff is not provided, use the default ISO output.
  if (!cutoff) {
    return false;
  }
  const duration = durationMap[cutoff]();
  /**
   * difference between now and the time provided
   * without Math.abs(), diff will return a negative number if passed a future date
   */
  const diff = Math.abs(+moment.duration(moment().diff(time)));
  /**
   * Humanize the date if the difference between the current date and provided date
   * is lower than the cutoff
   */
  return diff <= +duration;
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

  /** get the timezone from redux and use it as the moment timezone */
  const state = store.getState();
  const userTimezone = pathOr(
    'GMT',
    ['__resources', 'profile', 'data', 'timezone'],
    state
  );

  try {
    // Unknown error was causing this to crash in rare situations.
    time = moment.utc(date).tz(userTimezone);
  } catch (e) {
    // Better to return a blank date than an error or incorrect information.
    reportException(e);
    return 'Error getting date';
  }
  const formattedTime = shouldHumanize(time, options.humanizeCutoff)
    ? time.fromNow()
    : time.format(options.format || ISO_FORMAT);
  return formattedTime;
};

export default formatDate;
