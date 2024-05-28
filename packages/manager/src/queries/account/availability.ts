import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './queries';

import type { AccountAvailability } from '@linode/api-v4';
import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const useAllAccountAvailabilitiesQuery = (enabled: boolean = true) =>
  useQuery<AccountAvailability[], FormattedAPIError[]>({
    ...accountQueries.availability,
    enabled,
  });
