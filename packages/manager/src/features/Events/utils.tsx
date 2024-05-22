import * as React from 'react';

import { Typography } from 'src/components/Typography';

import type { EventMap } from './events.factory';
import type { Event, EventAction, EventStatus } from '@linode/api-v4';

// Higher-order function to wrap all JSX Elements and strings in Typography
export const withTypography = (
  eventMapFunction: (e: Event) => EventMap
): ((e: Event) => EventMap) => {
  return (e: Event) => {
    const eventMap = eventMapFunction(e);
    Object.keys(eventMap).forEach((key) => {
      const eventAction = eventMap[key as EventAction];
      if (eventAction) {
        Object.keys(eventAction).forEach((status) => {
          const message = eventAction[status as EventStatus];
          if (typeof message === 'string' || React.isValidElement(message)) {
            eventAction[status as EventStatus] = (
              <Typography>{message}</Typography>
            );
          }
        });
      }
    });

    return eventMap;
  };
};
