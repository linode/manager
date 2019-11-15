import * as moment from 'moment';

export const formatUptime = (uptime: number) => {
  /**
   * We get uptime from the Longview API in
   * seconds.
   */
  const duration = moment.duration(uptime, 'seconds');
  if (duration.days() > 1) {
    return `${duration.days()}d ${duration.hours()}h ${duration.minutes()}m`;
  } else if (duration.hours() > 1) {
    return `${duration.hours()}h ${duration.minutes()}m`;
  } else if (duration.minutes() > 1) {
    return `${duration.minutes()}m ${duration.seconds()}s`;
  } else {
    return `< 1 minute`;
  }
};
