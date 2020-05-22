import {Duration} from 'luxon'
export const formatUptime = (uptime: number) => {
  /**
   * We get uptime from the Longview API in
   * seconds.
   */
  const duration = Duration.fromObject({seconds:uptime});
  const days = Math.floor(duration.as('days'));
  if (days > 0) {
    return `${duration.days}d ${duration.hours}h ${duration.minutes}m`;
  } else if (duration.hours > 0) {
    return `${duration.hours}h ${duration.minutes}m`;
  } else if (duration.minutes > 0) {
    return `${duration.minutes}m ${duration.seconds}s`;
  } else {
    return `< 1 minute`;
  }
};
