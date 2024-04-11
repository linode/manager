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

const getAllPlacementGroupsRequest = () =>
  getAll<PlacementGroup>((params, filters) =>
    getPlacementGroups(params, filters)
  )().then((data) => data.data);

export const placementGroupQueries = createQueryKeys('placement-groups', {
  all: {
    queryFn: getAllPlacementGroupsRequest,
    queryKey: null,
  },
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
    ...placementGroupQueries.all,
  });

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
      queryClient.invalidateQueries(placementGroupQueries.all.queryKey);
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
      queryClient.invalidateQueries(placementGroupQueries.all.queryKey);
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
      queryClient.invalidateQueries(placementGroupQueries.all.queryKey);
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
    mutationFn: (req) => assignLinodesToPlacementGroup(placementGroupId, req),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(placementGroupQueries.paginated._def);
      queryClient.invalidateQueries(placementGroupQueries.all.queryKey);
      queryClient.invalidateQueries(
        placementGroupQueries.placementGroup(placementGroupId).queryKey
      );

      queryClient.invalidateQueries([
        linodeQueryKey,
        'linode',
        variables.linodes[0],
      ]);
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
    mutationFn: (req) =>
      unassignLinodesFromPlacementGroup(placementGroupId, req),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(placementGroupQueries.paginated._def);
      queryClient.invalidateQueries(placementGroupQueries.all.queryKey);
      queryClient.invalidateQueries(
        placementGroupQueries.placementGroup(placementGroupId).queryKey
      );

      queryClient.invalidateQueries([
        linodeQueryKey,
        'linode',
        variables.linodes[0],
      ]);
    },
  });
};
