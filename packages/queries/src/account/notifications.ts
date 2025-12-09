import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './queries';

import type { APIError, Notification } from '@linode/api-v4';

export const useNotificationsQuery = () =>
  useQuery<Notification[], APIError[]>(accountQueries.notifications);
