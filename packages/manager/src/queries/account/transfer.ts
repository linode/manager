import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './queries';

import type { RegionalNetworkUtilization } from '@linode/api-v4';
import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const useAccountNetworkTransfer = () =>
  useQuery<RegionalNetworkUtilization, FormattedAPIError[]>(
    accountQueries.transfer
  );
