import * as moment from 'moment';

export const formatUptime = (uptime: number) => {
  /**
   * We get uptime from the Longview API in
   * seconds.
   */
  const duration = moment.duration(uptime, 'seconds');
  const days = Math.floor(duration.asDays());
  if (days > 0) {
    return `${days}d ${duration.hours()}h ${duration.minutes()}m`;
  } else if (duration.hours() > 0) {
    return `${duration.hours()}h ${duration.minutes()}m`;
  } else if (duration.minutes() > 0) {
    return `${duration.minutes()}m ${duration.seconds()}s`;
  } else {
    return `< 1 minute`;
  }
};
