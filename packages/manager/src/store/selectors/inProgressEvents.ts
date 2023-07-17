import { createSelector } from 'reselect';

import { ApplicationState } from 'src/store';
import { isInProgressEvent } from 'src/store/events/event.helpers';

export default (type: string) =>
  createSelector(
    (state: ApplicationState) => state.events.events,
    (events) =>
      events.filter(
        (e) => isInProgressEvent(e) && e.entity && e.entity.type === type
      )
  );
