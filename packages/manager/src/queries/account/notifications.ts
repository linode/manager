import { Notification } from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './queries';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const useNotificationsQuery = () =>
  useQuery<Notification[], FormattedAPIError[]>(accountQueries.notifications);
