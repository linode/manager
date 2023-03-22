import {
  createEntityTransfer,
  CreateTransferPayload,
  EntityTransfer,
  getEntityTransfer,
  getEntityTransfers,
} from '@linode/api-v4/lib/entity-transfers';
import { APIError, Filter, Params } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { useProfile } from 'src/queries/profile';
import { creationHandlers, listToItemsByID, queryPresets } from './base';

export const queryKey = 'entity-transfers';

interface EntityTransfersData {
  results: number;
  entityTransfers: Record<string, EntityTransfer>;
}

const sortFilter = { '+order_by': 'created', '+order': 'desc' };

export const TRANSFER_FILTERS = {
  received: {
    ...sortFilter,
    '+and': [{ is_sender: false }, { status: { '+neq': 'pending' } }],
  },
  pending: {
    ...sortFilter,
    status: 'pending',
  },
  sent: {
    ...sortFilter,
    '+and': [{ is_sender: true }, { status: { '+neq': 'pending' } }],
  },
};

const getAllEntityTransfersRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getEntityTransfers(passedParams, passedFilter).then((data) => ({
    entityTransfers: listToItemsByID(data.data, 'token'),
    results: data.results,
  }));

export const useEntityTransfersQuery = (
  params: Params = {},
  filter: Filter = {}
) => {
  const { data: profile } = useProfile();

  return useQuery<EntityTransfersData, APIError[]>(
    [queryKey, params, filter],
    () => getAllEntityTransfersRequest(params, filter),
    {
      ...queryPresets.longLived,
      enabled: !profile?.restricted,
    }
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
    (createData) => {
      return createEntityTransfer(createData);
    },
    creationHandlers(queryKey, 'token')
  );
};
