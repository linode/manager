import { Event } from 'linode-js-sdk/lib/account';
import { Linode } from 'linode-js-sdk/lib/linodes'
import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';
import inProgressEvents from './inProgressEvents';

const findInProgressEvent = (e: Event[]) => (id: number) => {
  let idx = 0;
  const len = e.length;
  for (; idx < len; idx += 1) {
    const event = e[idx];
    const { entity } = event;

    if (entity!.id === id) {
      return event;
    }
  }

  return;
};

export default createSelector<
  ApplicationState,
  Linode[],
  Event[],
  Linode[]
>(
  state => state.__resources.linodes.entities,
  inProgressEvents('linode'),
  (linodes, events) => {
    const eventFor = findInProgressEvent(events);

    return linodes.map(linode => ({
      ...linode,
      recentEvent: eventFor(linode.id)
    }));
  }
);
