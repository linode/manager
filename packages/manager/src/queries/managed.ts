import { getSSHPubKey, ManagedSSHPubKey } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryPresets } from './base';

export const useManagedSSHKey = () =>
  useQuery<ManagedSSHPubKey, APIError[]>(
    'managedSSHKey',
    getSSHPubKey,
    queryPresets.longLived
  );
