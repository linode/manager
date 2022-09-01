import { Duration } from 'luxon';
export const formatUptime = (uptime: number) => {
  /**
   * We get uptime from the Longview API in
   * seconds.
   */
  const duration = Duration.fromObject({ seconds: uptime });
  const days = Math.floor(duration.as('days'));
  const hours = Math.floor(
    duration
      .minus({
        days,
      })
      .as('hours')
  );
  const minutes = Math.floor(
    duration
      .minus({
        days,
        hours,
      })
      .as('minutes')
  );
  const seconds = Math.floor(
    duration
      .minus({
        days,
        hours,
        minutes,
      })
      .as('seconds')
  );
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `< 1 minute`;
  }
};
