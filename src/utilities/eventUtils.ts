import { GLOBAL_EVENTS_BLACKLIST } from 'src/constants';

// Removes events we don't want to display.
export const removeBlacklistedEvents = (
  events: Linode.Event[] = [],
  blacklist = GLOBAL_EVENTS_BLACKLIST
) => {
  return events.filter(eachEvent => !blacklist.includes(eachEvent.action));
};
