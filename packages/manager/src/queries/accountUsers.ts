import { User, getUsers } from '@linode/api-v4/lib/account';
import { ResourcePage } from '@linode/api-v4/lib/types';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryPresets } from './base';

export const useAccountUsers = () =>
  useQuery<ResourcePage<User>, APIError[]>(
    'account-users',
    getUsers,
    queryPresets.oneTimeFetch
  );
