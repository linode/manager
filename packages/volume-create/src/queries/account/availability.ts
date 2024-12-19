import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './queries';

import type { APIError, AccountAvailability } from '@linode/api-v4';

export const useAllAccountAvailabilitiesQuery = (enabled: boolean = true) =>
  useQuery<AccountAvailability[], APIError[]>({
    ...accountQueries.availability,
    enabled,
  });
