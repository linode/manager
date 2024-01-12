import {
  assignVmsToPlacementGroup,
  createPlacementGroup,
  deletePlacementGroup,
  getPlacementGroup,
  getPlacementGroups,
  unassignVmsFromPlacementGroup,
  updatePlacementGroup,
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
  UpdatePlacementGroupPayload,
} from '@linode/api-v4';

export const queryKey = 'placement-groups';

export const usePlacementGroupsQuery = (
  params: Params,
  filter: Filter,
  enabled: boolean = true
) =>
  useQuery<ResourcePage<PlacementGroup>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getPlacementGroups(params, filter),
    { enabled, keepPreviousData: true }
  );

export const usePlacementGroupQuery = (
  placementGroupId: number,
  enabled: boolean = true
) => {
  return useQuery<PlacementGroup, APIError[]>(
    [queryKey, 'placement-group', placementGroupId],
    () => getPlacementGroup(placementGroupId),
    {
      enabled,
    }
  );
};

export const useCreatePlacementGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<PlacementGroup, APIError[], CreatePlacementGroupPayload>(
    createPlacementGroup,
    {
      onSuccess: (placementGroup) => {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.setQueryData(
          [queryKey, 'placement-groups', placementGroup.id],
          placementGroup
        );
        // If a restricted user creates an entity, we must make sure grants are up to date.
        queryClient.invalidateQueries([PROFILE_QUERY_KEY, 'grants']);
      },
    }
  );
};

export const useMutatePlacementGroup = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<PlacementGroup, APIError[], UpdatePlacementGroupPayload>(
    (data) => updatePlacementGroup(id, data),
    {
      onSuccess: (placementGroup) => {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.setQueryData(
          [queryKey, 'placement-group', id],
          placementGroup
        );
      },
    }
  );
};

export const useDeletePlacementGroup = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>(() => deletePlacementGroup(id), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.removeQueries([queryKey, 'placement-group', id]);
    },
  });
};

export const useAssignVmsToPlacementGroup = (
  id: number,
  linodeIds: [number]
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(
    () => assignVmsToPlacementGroup(id, linodeIds),
    {
      onSuccess: (placementGroup) => {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.setQueryData(
          [queryKey, 'placement-group', id],
          placementGroup
        );
      },
    }
  );
};

export const useUnassignVmsToPlacementGroup = (
  id: number,
  linodeIds: [number]
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(
    () => unassignVmsFromPlacementGroup(id, linodeIds),
    {
      onSuccess: (placementGroup) => {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.setQueryData(
          [queryKey, 'placement-group', id],
          placementGroup
        );
      },
    }
  );
};
