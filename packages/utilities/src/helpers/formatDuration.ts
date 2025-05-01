import type { Duration } from 'luxon';
/**
 * Will format duration (for server tasks) in hours, minutes and seconds
 * We do not handle larger units as this is not really a use case
 */
export const formatDuration = (duration: Duration) => {
  const hours = duration.as('hours');
  if (hours >= 1) {
    const dur = duration.shiftTo('hours', 'minutes');
    const mins = Math.round(dur.minutes);
    return `${dur.hours} hour${dur.hours > 1 ? 's' : ''}, ${mins} minute${
      mins >= 2 ? 's' : ''
    }`;
  }
  const minutes = duration.as('minutes');
  if (minutes >= 1) {
    const dur = duration.shiftTo('minutes', 'seconds');
    const secs = Math.round(dur.seconds);
    return `${dur.minutes} minute${dur.minutes > 1 ? 's' : ''}, ${secs} second${
      secs >= 2 ? 's' : ''
    }`;
  }
  const seconds = duration.as('seconds');
  const secs = Math.round(seconds);
  return `${secs} second${secs >= 2 ? 's' : ''}`;
};
