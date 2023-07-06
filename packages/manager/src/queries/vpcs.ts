import {
  CreateVPCPayload,
  UpdateVPCPayload,
  VPC,
  createVPC,
  deleteVPC,
  getVPC,
  getVPCs,
  updateVPC,
} from '@linode/api-v4';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export const queryKey = 'vpcs';

export const useVPCsQuery = (params: Params, filter: Filter) => {
  return useQuery<ResourcePage<VPC>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getVPCs(params, filter),
    { keepPreviousData: true }
  );
};

export const useVPCQuery = (id: number) => {
  return useQuery<VPC, APIError[]>([queryKey, 'vpc', id], () => getVPC(id));
};

export const useCreateVPCMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<VPC, APIError[], CreateVPCPayload>(createVPC, {
    onSuccess: (VPC) => {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.setQueryData([queryKey, 'vpc', VPC.id], VPC);
    },
  });
};

export const useUpdateVPCMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<VPC, APIError[], UpdateVPCPayload>(
    (data) => updateVPC(id, data),
    {
      onSuccess: (VPC) => {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.setQueryData<VPC>([queryKey, 'vpc', VPC.id], VPC);
      },
    }
  );
};

export const useDeleteVPCMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteVPC(id), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.removeQueries([queryKey, 'vpc', id]);
    },
  });
};
