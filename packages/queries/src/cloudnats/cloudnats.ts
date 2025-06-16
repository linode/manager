import {
  createCloudNAT,
  deleteCloudNAT,
  getCloudNAT,
  getCloudNATs,
  updateCloudNAT,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdateCloudNATRequest } from '@linode/api-v4';

export const cloudnatQueries = {
  all: () => ['cloudnats'],
  one: (id: number) => ['cloudnat', id],
};

export const useCloudNATsQuery = () =>
  useQuery({
    queryKey: cloudnatQueries.all(),
    queryFn: getCloudNATs,
  });

export const useCloudNATQuery = (id: number) =>
  useQuery({
    queryKey: cloudnatQueries.one(id),
    queryFn: () => getCloudNAT(id),
    enabled: Boolean(id),
  });

export const useCreateCloudNATMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCloudNAT,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.all(),
      }),
  });
};

export const useUpdateCloudNATMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCloudNATRequest) => updateCloudNAT(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.all(),
      });
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.one(id),
      });
    },
  });
};

export const useDeleteCloudNATMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCloudNAT,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: cloudnatQueries.all(),
      }),
  });
};
