import { getLogins } from '@linode/api-v4/lib/profile';
import { getEvents, Event, markEventSeen } from '@linode/api-v4/lib/account';
import { createContext, useCallback, useEffect, useState } from 'react';

export interface NotificationContextProps {
  events: Event[];
  loading: boolean;
  error?: string;
  requestEvents: () => void;
}

const defaultContext = {
  events: [],
  loading: false,
  requestEvents: () => null
};

export const notificationContext = createContext<NotificationContextProps>(
  defaultContext
);

export const useNotificationContext = (): NotificationContextProps => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [events, setEvents] = useState<Event[]>([]);

  const [mostRecentLogin, setRecentLogin] = useState<string | undefined>();

  /**
   * If we know the most recent time a user logged in,
   * request all events that have occurred on this account
   * since that time. This is a special case for the Dashboard
   * notifications center and notifications drawer.
   */
  const request = useCallback(() => {
    if (mostRecentLogin) {
      getEvents(
        {},
        {
          '+and': [
            { created: { '+gt': mostRecentLogin } },
            {
              '+or': [
                { action: 'community_like' },
                { action: 'community_question_reply' },
                { action: 'community_mention' }
              ]
            }
          ]
        }
      )
        .then(response => {
          setEvents(response.data);
          setLoading(false);
        })
        .catch(error => {
          setError(error[0].reason);
          setLoading(false);
        });
    }
  }, [mostRecentLogin]);

  useEffect(() => {
    setLoading(true);
    getLogins({}, { '+order_by': 'datetime', '+order': 'desc' })
      .then(response => {
        setRecentLogin(response.data[0]?.datetime);
        request();
      })
      .catch(_ => {
        setError('Unable to retrieve community events data');
        setLoading(false);
      });
  }, [request]);

  useEffect(() => {
    /**
     * If we have new events, mark them as seen.
     * This doesn't affect how we display them,
     * but consumers of the API should be made
     * aware that the events have been viewed.
     *
     * Swallow errors, since failure at this step
     * doesn't affect anything.
     */
    events.forEach(thisEvent => {
      if (!thisEvent.seen) {
        markEventSeen(thisEvent.id).catch(_ => null);
      }
    });
  }, [events]);

  return {
    events,
    loading,
    error,
    requestEvents: request
  };
};
