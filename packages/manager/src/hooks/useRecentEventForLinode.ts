import React from 'react';
import { useEventsInfiniteQuery } from 'src/queries/events';
import {
  isEventRelevantToLinode,
  isInProgressEvent,
} from 'src/utilities/eventUtils';

export const useRecentEventForLinode = (linodeId: number) => {
  const { data: eventsData } = useEventsInfiniteQuery({
    filter: {
      'entity.type': 'linode',
      'entity.id': linodeId,
    },
  });

  const pages = eventsData?.pages;

  return React.useMemo(() => {
    for (const page of pages ?? []) {
      for (const event of page.data) {
        if (
          isInProgressEvent(event) &&
          isEventRelevantToLinode(event, linodeId)
        ) {
          return event;
        }
      }
    }
    return undefined;
  }, [pages, linodeId]);
};
