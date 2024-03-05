import { APIError, Notification, getNotifications } from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import { accountQueries } from './account';

export const useNotificationsQuery = () =>
  useQuery<Notification[], APIError[]>(accountQueries.notifications);

export const getAllNotifications = () =>
  getAll<Notification>(getNotifications)().then((data) => data.data);
