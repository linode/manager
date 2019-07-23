import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';
import inProgressEvents from './inProgressEvents';

const findInProgressEvent = (e: Linode.Event[]) => (id: number) => {
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
  Linode.Linode[],
  Linode.Event[],
  Linode.Linode[]
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
