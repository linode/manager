import {
  assignLinodesToPlacementGroup,
  createPlacementGroup,
  deletePlacementGroup,
  getPlacementGroup,
  getPlacementGroups,
  unassignLinodesFromPlacementGroup,
  updatePlacementGroup,
} from '@linode/api-v4';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKey as linodeQueryKey } from 'src/queries/linodes/linodes';
import { getAll } from 'src/utilities/getAll';

import { profileQueries } from './profile';

import type {
  AssignLinodesToPlacementGroupPayload,
  CreatePlacementGroupPayload,
  PlacementGroup,
  UnassignLinodesFromPlacementGroupPayload,
  UpdatePlacementGroupPayload,
} from '@linode/api-v4';

export const placementGroupQueries = createQueryKeys('placement-groups', {
  all: (params: Params = {}, filters: Filter = {}) => ({
    queryFn: () => getAllPlacementGroupsRequest(),
    queryKey: [params, filters],
  }),
  paginated: (params: Params, filters: Filter) => ({
    queryFn: () => getPlacementGroups(params, filters),
    queryKey: [params, filters],
  }),
  placementGroup: (placementGroupId: number) => ({
    queryFn: () => getPlacementGroup(placementGroupId),
    queryKey: [placementGroupId],
  }),
});

export const useAllPlacementGroupsQuery = (enabled = true) =>
  useQuery<PlacementGroup[], APIError[]>({
    enabled,
    ...placementGroupQueries.all(),
  });

const getAllPlacementGroupsRequest = () =>
  getAll<PlacementGroup>((params, filters) =>
    getPlacementGroups(params, filters)
  )().then((data) => data.data);

export const usePlacementGroupsQuery = (
  params: Params,
  filter: Filter,
  enabled: boolean = true
) =>
  useQuery<ResourcePage<PlacementGroup>, APIError[]>({
    enabled,
    keepPreviousData: true,
    ...placementGroupQueries.paginated(params, filter),
  });

export const usePlacementGroupQuery = (
  placementGroupId: number,
  enabled: boolean = true
) => {
  return useQuery<PlacementGroup, APIError[]>({
    enabled,
    ...placementGroupQueries.placementGroup(placementGroupId),
  });
};

export const useCreatePlacementGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<PlacementGroup, APIError[], CreatePlacementGroupPayload>({
    mutationFn: createPlacementGroup,
    onSuccess: (placementGroup) => {
      queryClient.invalidateQueries(placementGroupQueries.paginated._def);
      queryClient.invalidateQueries(placementGroupQueries.all._def);
      queryClient.setQueryData<PlacementGroup>(
        placementGroupQueries.placementGroup(placementGroup.id).queryKey,
        placementGroup
      );

      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries(profileQueries.grants.queryKey);
    },
  });
};

export const useMutatePlacementGroup = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<PlacementGroup, APIError[], UpdatePlacementGroupPayload>({
    mutationFn: (data) => updatePlacementGroup(id, data),
    onSuccess: (placementGroup) => {
      queryClient.invalidateQueries(placementGroupQueries.paginated._def);
      queryClient.invalidateQueries(placementGroupQueries.all._def);
      queryClient.setQueryData(
        placementGroupQueries.placementGroup(id).queryKey,
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
      queryClient.invalidateQueries(placementGroupQueries.paginated._def);
      queryClient.invalidateQueries(placementGroupQueries.all._def);
      queryClient.removeQueries(
        placementGroupQueries.placementGroup(id).queryKey
      );
    },
  });
};

export const useAssignLinodesToPlacementGroup = (placementGroupId: number) => {
  const queryClient = useQueryClient();

  return useMutation<
    PlacementGroup,
    APIError[],
    AssignLinodesToPlacementGroupPayload
  >({
    mutationFn: (data) => assignLinodesToPlacementGroup(placementGroupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(placementGroupQueries.paginated._def);
      queryClient.invalidateQueries(placementGroupQueries.all._def);
      queryClient.invalidateQueries(
        placementGroupQueries.placementGroup(placementGroupId).queryKey
      );

      // Invalidate all linodes query since we use the list to populate the select in the assign drawer
      queryClient.invalidateQueries([linodeQueryKey, 'all']);
    },
  });
};

export const useUnassignLinodesFromPlacementGroup = (
  placementGroupId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<
    PlacementGroup,
    APIError[],
    UnassignLinodesFromPlacementGroupPayload
  >({
    mutationFn: (data) =>
      unassignLinodesFromPlacementGroup(placementGroupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(placementGroupQueries.paginated._def);
      queryClient.invalidateQueries(placementGroupQueries.all._def);
      queryClient.invalidateQueries(
        placementGroupQueries.placementGroup(placementGroupId).queryKey
      );

      // Invalidate all linodes query since we use the list to populate the select in the assign drawer
      queryClient.invalidateQueries([linodeQueryKey, 'all']);
    },
  });
};
