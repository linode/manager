import {
  assignLinodesToPlacementGroup,
  createPlacementGroup,
  deletePlacementGroup,
  getPlacementGroup,
  getPlacementGroups,
  unassignLinodesFromPlacementGroup,
  updatePlacementGroup,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { linodeQueries } from '../linodes';
import { profileQueries } from '../profile';

import type { EventHandlerData } from '../eventHandlers';
import type {
  APIError,
  AssignLinodesToPlacementGroupPayload,
  CreatePlacementGroupPayload,
  Filter,
  Params,
  PlacementGroup,
  ResourcePage,
  UnassignLinodesFromPlacementGroupPayload,
  UpdatePlacementGroupPayload,
} from '@linode/api-v4';

const getAllPlacementGroupsRequest = (
  _params: Params = {},
  _filter: Filter = {},
) =>
  getAll<PlacementGroup>((params, filter) =>
    getPlacementGroups({ ...params, ..._params }, { ...filter, ..._filter }),
  )().then((data) => data.data);

export const placementGroupQueries = createQueryKeys('placement-groups', {
  all: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAllPlacementGroupsRequest(params, filter),
    queryKey: [params, filter],
  }),
  paginated: (params: Params, filter: Filter) => ({
    queryFn: () => getPlacementGroups(params, filter),
    queryKey: [params, filter],
  }),
  placementGroup: (placementGroupId: number) => ({
    queryFn: () => getPlacementGroup(placementGroupId),
    queryKey: [placementGroupId],
  }),
});

interface AllPlacementGroupsQueryOptions {
  enabled?: boolean;
  filter?: Filter;
  params?: Params;
}

export const useAllPlacementGroupsQuery = ({
  enabled = true,
  filter = {},
  params = {},
}: AllPlacementGroupsQueryOptions) =>
  useQuery<PlacementGroup[], APIError[]>({
    enabled,
    ...placementGroupQueries.all(params, filter),
  });

export const usePlacementGroupsQuery = (
  params: Params,
  filter: Filter,
  enabled: boolean = true,
) =>
  useQuery<ResourcePage<PlacementGroup>, APIError[]>({
    enabled,
    placeholderData: keepPreviousData,
    ...placementGroupQueries.paginated(params, filter),
  });

export const usePlacementGroupQuery = (
  placementGroupId: number,
  enabled: boolean = true,
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
    onSuccess(placementGroup) {
      queryClient.invalidateQueries({
        queryKey: placementGroupQueries.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: placementGroupQueries.all._def,
      });
      queryClient.setQueryData<PlacementGroup>(
        placementGroupQueries.placementGroup(placementGroup.id).queryKey,
        placementGroup,
      );

      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });
    },
  });
};

export const useMutatePlacementGroup = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<PlacementGroup, APIError[], UpdatePlacementGroupPayload>({
    mutationFn: (data) => updatePlacementGroup(id, data),
    onSuccess(placementGroup) {
      queryClient.invalidateQueries({
        queryKey: placementGroupQueries.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: placementGroupQueries.all._def,
      });
      queryClient.setQueryData<PlacementGroup>(
        placementGroupQueries.placementGroup(id).queryKey,
        placementGroup,
      );
    },
  });
};

export const useDeletePlacementGroup = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: () => deletePlacementGroup(id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: placementGroupQueries.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: placementGroupQueries.all._def,
      });
      queryClient.removeQueries({
        queryKey: placementGroupQueries.placementGroup(id).queryKey,
      });
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
      queryClient.invalidateQueries({
        queryKey: placementGroupQueries.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: placementGroupQueries.all._def,
      });
      queryClient.invalidateQueries({
        queryKey:
          placementGroupQueries.placementGroup(placementGroupId).queryKey,
      });

      queryClient.invalidateQueries(linodeQueries.linodes);

      for (const linodeId of variables.linodes) {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: linodeQueries.linode(linodeId).queryKey,
        });
      }
    },
  });
};

export const useUnassignLinodesFromPlacementGroup = (
  placementGroupId: number,
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
      queryClient.invalidateQueries({
        queryKey: placementGroupQueries.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: placementGroupQueries.all._def,
      });
      queryClient.invalidateQueries({
        queryKey:
          placementGroupQueries.placementGroup(placementGroupId).queryKey,
      });

      queryClient.invalidateQueries(linodeQueries.linodes);

      for (const linodeId of variables.linodes) {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: linodeQueries.linode(linodeId).queryKey,
        });
      }
    },
  });
};

export const placementGroupEventHandler = ({
  event,
  invalidateQueries,
}: EventHandlerData) => {
  const { action, entity, secondary_entity } = event;
  // for assignment/unassignment events
  // in the case of a migration, the assignment/unassignment events are happening asynchronously,
  // without using the hook. We need to invalidate the placement group queries here.
  // invalidateQueries({ queryKey: placementGroupQueries._def });
  // event looks as follow:
  // {
  //   "id": {id},
  //   "created": {created},
  //   "seen": false,
  //   "read": false,
  //   "percent_complete": null,
  //   "time_remaining": null,
  //   "rate": null,
  //   "duration": null,
  //   "action": "placement_group_unassign",
  //   "username": {username},
  //   "entity": {
  //       "label": {label},
  //       "id": {id},
  //       "type": "placement_group",
  //       "url": "/v4/placement/groups/{id}"
  //   },
  //   "status": "notification",
  //   "secondary_entity": {
  //       "id": {id},
  //       "type": "linode",
  //       "label": {label},
  //       "url": "/v4/linode/instances/{id}"
  //   },
  //   "message": ""
  // }
  if (
    action !== 'placement_group_unassign' &&
    action !== 'placement_group_assign'
  ) {
    return;
  }

  if (entity && secondary_entity) {
    invalidateQueries({
      queryKey: placementGroupQueries.placementGroup(entity.id).queryKey,
    });
    invalidateQueries({
      queryKey: linodeQueries.linode(secondary_entity.id).queryKey,
    });
  }

  invalidateQueries({
    queryKey: placementGroupQueries.paginated._def,
  });
  invalidateQueries({
    queryKey: linodeQueries.linodes._ctx.all._def,
  });
};
