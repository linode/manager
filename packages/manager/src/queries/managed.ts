import { getSSHPubKey, ManagedSSHPubKey } from '@linode/api-v4';
import { APIError } from '@linode/api-v4';
import { useQuery } from 'react-query';
import { queryPresets } from './base';

export const useManagedSSHKey = () =>
  useQuery<ManagedSSHPubKey, APIError[]>(
    'managedSSHKey',
    getSSHPubKey,
    queryPresets.oneTimeFetch
  );
