import { getLogins } from '@linode/api-v4/lib/profile';
import { getEvents, Event } from '@linode/api-v4/lib/account';
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

  const request = useCallback(() => {
    getEvents(
      {},
      {
        created: {
          '+gt': mostRecentLogin
        }
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
  }, [mostRecentLogin]);

  useEffect(() => {
    getLogins({}, { '+order_by': 'datetime', '+order': 'desc' }).then(
      response => {
        setRecentLogin(response.data[0]?.datetime);
        request();
      }
    );
  }, [request]);

  return {
    events,
    loading,
    error,
    requestEvents: request
  };
};
