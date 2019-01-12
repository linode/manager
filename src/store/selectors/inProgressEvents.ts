import { createSelector } from 'reselect';
import { isInProgressEvent } from 'src/store/events';

export default (type: string) => createSelector<ApplicationState, Linode.Event[], Linode.Event[]>(
  (state) => state.events.events,
  (events) => events.filter(e => isInProgressEvent(e) && e.entity && e.entity.type === type)
);
