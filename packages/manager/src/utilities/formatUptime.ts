export const formatUptime = (uptime: number) => {
  // const days = Math.floor(uptime / 86400);
  // const hours = Math.floor(uptime / 3600);
  // const minutes = Math.floor((uptime / 60) % 60);
  // return `${days}d ${hours}h ${minutes}m`;
  if (uptime > 86400) {
    // More than 1 day
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor((uptime / 60) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  } else if (uptime > 3600) {
    // > 1 hour
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime / 60) % 60);
    return `${hours}h ${minutes}m`;
  } else if (uptime > 60) {
    // > 1 minute
    const minutes = Math.floor(uptime / 60);
    const seconds = Math.floor(uptime % 60);
    return `${minutes}m ${seconds}s`;
  } else {
    return `< 1 minute`;
  }
};
