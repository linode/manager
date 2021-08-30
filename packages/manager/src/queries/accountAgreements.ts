import { Agreements, getAccountAgreements } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryPresets } from './base';

export const queryKey = 'account-agreements';

export const useAccountAgreements = () =>
  useQuery<Agreements, APIError[]>(
    queryKey,
    getAccountAgreements,
    queryPresets.oneTimeFetch
  );
