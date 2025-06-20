import {
  createCloudNAT,
  deleteCloudNAT,
  getCloudNAT,
  getCloudNATs,
  updateCloudNAT,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdateCloudNATPayload } from '@linode/api-v4';

export const cloudnatQueries = createQueryKeys('cloudnats', {
  all: {
    queryFn: getCloudNATs,
    queryKey: null,
  },
  one: (id: number) => ({
    queryFn: () => getCloudNAT(id),
    queryKey: [id],
  }),
});

export const useCloudNATsQuery = () => useQuery(cloudnatQueries.all);

export const useCloudNATQuery = (id: number) =>
  useQuery({
    ...cloudnatQueries.one(id),
    enabled: Boolean(id),
  });

export const useCreateCloudNATMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCloudNAT,
    onSuccess: (cloudNAT) => {
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.all.queryKey,
      });

      queryClient.setQueryData(
        cloudnatQueries.one(cloudNAT.id).queryKey,
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
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.all.queryKey,
      });

      queryClient.setQueryData(
        cloudnatQueries.one(id).queryKey,
        updatedCloudNAT,
      );
    },
  });
};

export const useDeleteCloudNATMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCloudNAT,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.all.queryKey,
      }),
  });
};
