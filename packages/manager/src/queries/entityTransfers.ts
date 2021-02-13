import {
  EntityTransfer,
  getEntityTransfers
} from '@linode/api-v4/lib/entity-transfers';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query'; // useMutation
import { getAll } from 'src/utilities/getAll';
import {
  //   mutationHandlers,
  //   listToItemsByID,
  //   HasID,
  //   creationHandlers,
  //   deletionHandlers,
  //   queryClient,
  //   ItemsByID,
  queryPresets
} from './base';

const queryKey = 'queryEntityTransfers';

const getAllEntityTransfersRequest = () =>
  getAll<EntityTransfer>((passedParams, passedFilter) =>
    getEntityTransfers(passedParams, passedFilter)
  )().then(data => data.data);

export const useEntityTransfersQuery = () => {
  return useQuery<EntityTransfer[], APIError[]>(
    queryKey,
    getAllEntityTransfersRequest,
    queryPresets.longLived
  );
};
