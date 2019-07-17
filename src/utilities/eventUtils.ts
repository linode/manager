import { GLOBAL_EVENTS_BLACKLIST } from 'src/constants';

// Removes events we don't want to display.
export const hideBlacklistedEvents = (
  events: Linode.Event[] = [],
  blacklist = GLOBAL_EVENTS_BLACKLIST
) => {
  return events.map(eachEvent => {
    return blacklist.includes(eachEvent.action)
      ? { ...eachEvent, _hidden: true }
      : { ...eachEvent, _hidden: false };
  });
};
