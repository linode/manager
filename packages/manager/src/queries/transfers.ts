import {
  EntityTransfer,
  getEntityTransfer
} from '@linode/api-v4/lib/entity-transfers';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryPresets } from './base';

const queryKey = 'entity-transfers';

export const useTransferQuery = (token: string, enabled: boolean = true) => {
  return useQuery<EntityTransfer, APIError[]>(
    [queryKey, token],
    () => getEntityTransfer(token),
    { ...queryPresets.shortLived, enabled }
  );
};
