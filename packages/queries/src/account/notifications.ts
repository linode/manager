import { APIError, Notification } from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './queries';

export const useNotificationsQuery = () =>
  useQuery<Notification[], APIError[]>(accountQueries.notifications);
