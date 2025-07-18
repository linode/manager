import {
  createEntityTransfer,
  getEntityTransfer,
} from '@linode/api-v4/lib/entity-transfers';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { creationHandlers, queryPresets } from '../base';
import { useProfile } from '../profile';
import { getAllEntityTransfersRequest } from './requests';

import type {
  CreateTransferPayload,
  EntityTransfer,
} from '@linode/api-v4/lib/entity-transfers';
import type { APIError, Filter, Params } from '@linode/api-v4/lib/types';

export const entityTransfersQueryKey = 'entity-transfers';

interface EntityTransfersData {
  entityTransfers: Record<string, EntityTransfer>;
  results: number;
}

const sortFilter = { '+order': 'desc', '+order_by': 'created' };

export const TRANSFER_FILTERS = {
  pending: {
    ...sortFilter,
    status: 'pending',
  },
  received: {
    ...sortFilter,
    '+and': [{ is_sender: false }, { status: { '+neq': 'pending' } }],
  },
  sent: {
    ...sortFilter,
    '+and': [{ is_sender: true }, { status: { '+neq': 'pending' } }],
  },
};

export const useEntityTransfersQuery = (
  params: Params = {},
  filter: Filter = {},
) => {
  const { data: profile } = useProfile();

  return useQuery<EntityTransfersData, APIError[]>({
    queryFn: () => getAllEntityTransfersRequest(params, filter),
    queryKey: [entityTransfersQueryKey, params, filter],
    ...queryPresets.longLived,
    enabled: !profile?.restricted,
  });
};

export const useTransferQuery = (token: string, enabled: boolean = true) => {
  return useQuery<EntityTransfer, APIError[]>({
    queryFn: () => getEntityTransfer(token),
    queryKey: [entityTransfersQueryKey, token],
    ...queryPresets.shortLived,
    enabled,
    retry: false,
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation<EntityTransfer, APIError[], CreateTransferPayload>({
    mutationFn: (createData) => {
      return createEntityTransfer(createData);
    },
    ...creationHandlers([entityTransfersQueryKey], 'token', queryClient),
  });
};
