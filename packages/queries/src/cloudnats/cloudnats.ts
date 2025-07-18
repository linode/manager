import {
  assignCloudNATAddress,
  createCloudNAT,
  deleteCloudNAT,
  deleteCloudNATAddress,
  getCloudNAT,
  getCloudNATAddress,
  getCloudNATAddresses,
  getCloudNATs,
  updateCloudNAT,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAllCloudNATsRequest } from './requests';

import type { Filter, Params, UpdateCloudNATPayload } from '@linode/api-v4';

export const cloudnatQueries = createQueryKeys('cloudnats', {
  all: (filter: Filter = {}) => ({
    queryFn: () => getAllCloudNATsRequest(filter),
    queryKey: [filter],
  }),
  paginated: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getCloudNATs(params, filter),
    queryKey: [params, filter],
  }),
  cloudnat: (id: number) => ({
    queryFn: () => getCloudNAT(id),
    queryKey: [id],
  }),
  cloudnatAddresses: (
    cloudNATId: number,
    params: Params = {},
    filter: Filter = {},
  ) => ({
    queryFn: () => getCloudNATAddresses(cloudNATId, params, filter),
    queryKey: [cloudNATId, params, filter],
  }),
  cloudnatAddress: (cloudNATId: number, address: string) => ({
    queryFn: () => getCloudNATAddress(cloudNATId, address),
    queryKey: [cloudNATId, address],
  }),
});

export const useAllCloudNATsQuery = (filter: Filter = {}) =>
  useQuery(cloudnatQueries.all(filter));

export const useCloudNATsQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled = true,
) =>
  useQuery({
    ...cloudnatQueries.paginated(params, filter),
    enabled,
  });

export const useCloudNATQuery = (id: number) =>
  useQuery({
    ...cloudnatQueries.cloudnat(id),
    enabled: Boolean(id),
  });

export const useCreateCloudNATMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCloudNAT,
    onSuccess: (cloudNAT) => {
      queryClient.invalidateQueries({ queryKey: cloudnatQueries.all._def });
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.paginated._def,
      });

      queryClient.setQueryData(
        cloudnatQueries.cloudnat(cloudNAT.id).queryKey,
        cloudNAT,
      );
    },
  });
};

export const useUpdateCloudNATMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCloudNATPayload) => updateCloudNAT(id, data),
    onSuccess: (updatedCloudNAT) => {
      queryClient.invalidateQueries({ queryKey: cloudnatQueries.all._def });
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.paginated._def,
      });

      queryClient.setQueryData(
        cloudnatQueries.cloudnat(id).queryKey,
        updatedCloudNAT,
      );
    },
  });
};

export const useDeleteCloudNATMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteCloudNAT(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cloudnatQueries.all._def });
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.paginated._def,
      });

      queryClient.removeQueries({
        queryKey: cloudnatQueries.cloudnat(id).queryKey,
      });
    },
  });
};

export const useCloudNATAddressesQuery = (
  cloudNATId: number,
  params: Params = {},
  filter: Filter = {},
  enabled = true,
) =>
  useQuery({
    ...cloudnatQueries.cloudnatAddresses(cloudNATId, params, filter),
    enabled,
  });

export const useCloudNATAddressQuery = (
  cloudNATId: number,
  address: string,
  enabled = true,
) =>
  useQuery({
    ...cloudnatQueries.cloudnatAddress(cloudNATId, address),
    enabled: Boolean(cloudNATId && address && enabled),
  });

export const useAssignCloudNATAddressMutation = (cloudNATId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { address: string }) =>
      assignCloudNATAddress(cloudNATId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.cloudnatAddresses(cloudNATId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.cloudnat(cloudNATId).queryKey,
      });
    },
  });
};

export const useDeleteCloudNATAddressMutation = (
  cloudNATId: number,
  address: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteCloudNATAddress(cloudNATId, address),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.cloudnatAddresses(cloudNATId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.cloudnat(cloudNATId).queryKey,
      });
      queryClient.removeQueries({
        queryKey: cloudnatQueries.cloudnatAddress(cloudNATId, address).queryKey,
      });
    },
  });
};
