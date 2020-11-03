import { getSSHPubKey, ManagedSSHPubKey } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

const keys = {
  managedSSHKey: 'managedSSHKey'
};

export const useManagedSSHKey = () =>
  useQuery<ManagedSSHPubKey, APIError[]>(
    keys.managedSSHKey,
    () => getSSHPubKey(),
    {
      refetchOnWindowFocus: false,
      staleTime: Infinity
    }
  );
