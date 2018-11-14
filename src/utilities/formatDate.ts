import * as moment from 'moment-timezone';

import { ISO_FORMAT } from 'src/constants';
import { reportException } from 'src/exceptionReporting';

export type TimeInterval = 'day' | 'week' | 'month' | 'year' | 'never';

const durationMap = {
  'day': () => moment.duration(1,'days'),
  'week': () => moment.duration(1,'weeks'),
  'month': () => moment.duration(1,'months'),
  'year': () => moment.duration(1,'years'),
  'never': () => moment.duration(1000,'years'),
}

export const shouldHumanize = (time: moment.Moment, cutoff?: TimeInterval): boolean => {
  // If cutoff is not provided, use the default ISO output.
  if (!cutoff) { return false; }
  const duration = durationMap[cutoff]();
  const diff =  moment.duration(moment().diff(time));
  // Humanize the date if it is earlier than the cutoff:
  return diff <= duration;
}

interface FormatDateOptions {
  humanizeCutoff?: TimeInterval;
  format?: string;
  timezone?: string;
}

export const formatDate = (date: string, options: FormatDateOptions = {}): string | null => {
  let time;
  try {
    // Unknown error was causing this to crash in rare situations.
    time = moment.utc(date).tz(options.timezone || 'GMT');
  }
  catch(e) {
    // Better to return a blank date than an error or incorrect information.
    reportException(e);
    return null;
  }
  const formattedTime = shouldHumanize(time, options.humanizeCutoff)
    ? time.fromNow()
    : time.format(options.format || ISO_FORMAT)
    return formattedTime;
};

export default formatDate;