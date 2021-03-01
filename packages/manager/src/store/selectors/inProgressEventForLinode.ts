import { Event } from '@linode/api-v4/lib/account';
import { Linode } from '@linode/api-v4/lib/linodes';
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

export default createSelector<ApplicationState, Linode[], Event[], Linode[]>(
  (state) => Object.values(state.__resources.linodes.itemsById),
  inProgressEvents('linode'),
  (linodes, events) => {
    const eventFor = findInProgressEvent(events);

    return linodes.map((linode) => ({
      ...linode,
      recentEvent: eventFor(linode.id),
    }));
  }
);
