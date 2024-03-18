import { APIError, Notification, getNotifications } from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import { queryKey as accountQueryKey } from './account';

export const queryKey = [accountQueryKey, 'notifications'];

export const useNotificationsQuery = () =>
  useQuery<Notification[], APIError[]>({
    queryFn: getAllNotifications,
    queryKey,
  });

export const getAllNotifications = () =>
  getAll<Notification>(getNotifications)().then((data) => data.data);
