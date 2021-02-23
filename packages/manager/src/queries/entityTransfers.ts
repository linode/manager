import {
  createEntityTransfer,
  CreateTransferPayload,
  EntityTransfer,
  getEntityTransfer,
  getEntityTransfers
} from '@linode/api-v4/lib/entity-transfers';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { creationHandlers, listToItemsByID, queryPresets } from './base';

export const queryKey = 'entity-transfers';

const getAllEntityTransfersRequest = () =>
  getAll<EntityTransfer>((passedParams, passedFilter) =>
    getEntityTransfers(passedParams, passedFilter)
  )().then(data => listToItemsByID(data.data, 'token'));

export const useEntityTransfersQuery = () => {
  return useQuery<Record<string, EntityTransfer>, APIError[]>(
    queryKey,
    getAllEntityTransfersRequest,
    queryPresets.longLived
  );
};

export const useTransferQuery = (token: string, enabled: boolean = true) => {
  return useQuery<EntityTransfer, APIError[]>(
    [queryKey, token],
    () => getEntityTransfer(token),
    { ...queryPresets.shortLived, enabled, retry: false }
  );
};

export const useCreateTransfer = () => {
  return useMutation<EntityTransfer, APIError[], CreateTransferPayload>(
    createData => {
      return createEntityTransfer(createData);
    },
    creationHandlers(queryKey, 'token')
  );
};
