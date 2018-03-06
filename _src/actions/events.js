export const RESET_EVENTS_POLL = '@@events/RESET_EVENTS_POLL';

export function resetEventsPoll() {
  return { type: RESET_EVENTS_POLL };
}
