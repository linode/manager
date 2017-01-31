
export default function sortEvents(eventsDict) {
  const events = Object.values(eventsDict.events);
  if (!events.length) {
    return [];
  }

  // TODO: address with request filter
  return events.reverse();
}
