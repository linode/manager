import { APIError, getNotifications, Notification } from '@linode/api-v4';
import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryKey as accountQueryKey } from './account';

export const queryKey = [accountQueryKey, 'notifications'];

export const useNotificationsQuery = () =>
  useQuery<Notification[], APIError[]>({
    queryKey,
    queryFn: getAllNotifications,
  });

export const getAllNotifications = () =>
  getAll<Notification>(getNotifications)().then((data) => data.data);
