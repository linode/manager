import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryKey as accountQueryKey } from './account';
import { APIError, getNotifications, Notification } from '@linode/api-v4';

export const queryKey = [accountQueryKey, 'notifications'];

export const useNotificationsQuery = () =>
  useQuery<Notification[], APIError[]>({
    queryFn: getAllNotifications,
    queryKey,
  });

export const getAllNotifications = () =>
  getAll<Notification>(getNotifications)().then((data) => data.data);
