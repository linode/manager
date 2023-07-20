import React from 'react';

import { useEventsInfiniteQuery } from 'src/queries/events';
import {
  isEventRelevantToLinode,
  isInProgressEvent,
} from 'src/utilities/eventUtils';

export const useRecentEventForLinode = (linodeId: number, enabled = true) => {
  const { events } = useEventsInfiniteQuery({ enabled });

  return React.useMemo(
    () =>
      events?.find(
        (event) =>
          isInProgressEvent(event) && isEventRelevantToLinode(event, linodeId)
      ),
    [events, linodeId]
  );
};
