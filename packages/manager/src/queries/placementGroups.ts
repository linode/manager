import {
  assignVMsToPlacementGroup,
  createPlacementGroup,
  deletePlacementGroup,
  getPlacementGroup,
  getPlacementGroups,
  renamePlacementGroup,
  unassignVMsFromPlacementGroup,
} from '@linode/api-v4';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { queryKey as PROFILE_QUERY_KEY } from './profile';

import type {
  CreatePlacementGroupPayload,
  PlacementGroup,
  RenamePlacementGroupPayload,
} from '@linode/api-v4';

export const queryKey = 'placement-groups';

export const usePlacementGroupsQuery = (
  params: Params,
  filter: Filter,
  enabled: boolean = true
) =>
  useQuery<ResourcePage<PlacementGroup>, APIError[]>({
    enabled,
    keepPreviousData: true,
    queryFn: () => getPlacementGroups(params, filter),
    queryKey: [queryKey, 'paginated', params, filter],
  });

export const usePlacementGroupQuery = (
  placementGroupId: number,
  enabled: boolean = true
) => {
  return useQuery<PlacementGroup, APIError[]>({
    enabled,
    queryFn: () => getPlacementGroup(placementGroupId),
    queryKey: [queryKey, 'placement-group', placementGroupId],
  });
};

export const useCreatePlacementGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<PlacementGroup, APIError[], CreatePlacementGroupPayload>({
    mutationFn: createPlacementGroup,
    onSuccess: (placementGroup) => {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.setQueryData(
        [queryKey, 'placement-groups', placementGroup.id],
        placementGroup
      );
      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries([PROFILE_QUERY_KEY, 'grants']);
    },
  });
};

export const useMutatePlacementGroup = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<PlacementGroup, APIError[], RenamePlacementGroupPayload>({
    mutationFn: (data) => renamePlacementGroup(id, data),
    onSuccess: (placementGroup) => {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.setQueryData(
        [queryKey, 'placement-group', id],
        placementGroup
      );
    },
  });
};

export const useDeletePlacementGroup = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: () => deletePlacementGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.removeQueries([queryKey, 'placement-group', id]);
    },
  });
};

export const useAssignVMsToPlacementGroup = (
  id: number,
  linodeIds: [number]
) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: () => assignVMsToPlacementGroup(id, linodeIds),
    onSuccess: (updatedPlacementGroup) => {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.setQueryData(
        [queryKey, 'placement-group', id],
        updatedPlacementGroup
      );
    },
  });
};

export const useUnassignVMsToPlacementGroup = (
  id: number,
  linodeIds: [number]
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => unassignVMsFromPlacementGroup(id, linodeIds),
    onSuccess: (updatedPlacementGroup) => {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.setQueryData(
        [queryKey, 'placement-group', id],
        updatedPlacementGroup
      );
    },
  });
};
