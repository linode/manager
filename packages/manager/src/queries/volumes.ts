import {
  AttachVolumePayload,
  CloneVolumePayload,
  ResizeVolumePayload,
  UpdateVolumeRequest,
  Volume,
  VolumeRequestPayload,
  attachVolume,
  cloneVolume,
  createVolume,
  deleteVolume,
  detachVolume,
  getLinodeVolumes,
  getVolumeTypes,
  getVolumes,
  resizeVolume,
  updateVolume,
} from '@linode/api-v4';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { Filter, Params, PriceType } from '@linode/api-v4/src/types';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { EventHandlerData } from 'src/hooks/useEventHandlers';
import { getAll } from 'src/utilities/getAll';

import { accountQueries } from './account/queries';
import { queryPresets, updateInPaginatedStore } from './base';
import { profileQueries } from './profile';

export const queryKey = 'volumes';

export const useVolumesQuery = (params: Params, filters: Filter) =>
  useQuery<ResourcePage<Volume>, APIError[]>(
    [queryKey, 'paginated', params, filters],
    () => getVolumes(params, filters),
    { keepPreviousData: true }
  );

export const useInfiniteVolumesQuery = (filter: Filter) =>
  useInfiniteQuery<ResourcePage<Volume>, APIError[]>(
    [queryKey, 'infinite', filter],
    ({ pageParam }) => getVolumes({ page: pageParam, page_size: 25 }, filter),
    {
      getNextPageParam: ({ page, pages }) => {
        if (page === pages) {
          return undefined;
        }
        return page + 1;
      },
    }
  );

export const useAllVolumesQuery = (
  params: Params = {},
  filters: Filter = {},
  enabled = true
) =>
  useQuery<Volume[], APIError[]>(
    [queryKey, 'all', params, filters],
    () => getAllVolumes(params, filters),
    {
      enabled,
    }
  );

export const useLinodeVolumesQuery = (
  linodeId: number,
  params: Params = {},
  filters: Filter = {},
  enabled = true
) =>
  useQuery<ResourcePage<Volume>, APIError[]>(
    [queryKey, 'linode', linodeId, params, filters],
    () => getLinodeVolumes(linodeId, params, filters),
    { enabled, keepPreviousData: true }
  );

interface ResizeVolumePayloadWithId extends ResizeVolumePayload {
  volumeId: number;
}

export const useResizeVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Volume, APIError[], ResizeVolumePayloadWithId>(
    ({ volumeId, ...data }) => resizeVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(
          [queryKey, 'paginated'],
          volume.id,
          volume,
          queryClient
        );
      },
    }
  );
};

interface CloneVolumePayloadWithId extends CloneVolumePayload {
  volumeId: number;
}

export const useCloneVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Volume, APIError[], CloneVolumePayloadWithId>(
    ({ volumeId, ...data }) => cloneVolume(volumeId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );
};

export const useDeleteVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { id: number }>(
    ({ id }) => deleteVolume(id),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );
};

export const useCreateVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Volume, APIError[], VolumeRequestPayload>(createVolume, {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries(profileQueries.grants.queryKey);
    },
  });
};

interface UpdateVolumePayloadWithId extends UpdateVolumeRequest {
  volumeId: number;
}

export const useUpdateVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Volume, APIError[], UpdateVolumePayloadWithId>(
    ({ volumeId, ...data }) => updateVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(
          [queryKey, 'paginated'],
          volume.id,
          volume,
          queryClient
        );
        if (volume.linode_id) {
          queryClient.invalidateQueries([queryKey, 'linode', volume.linode_id]);
        }
      },
    }
  );
};

interface AttachVolumePayloadWithId extends AttachVolumePayload {
  volumeId: number;
}

export const useAttachVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Volume, APIError[], AttachVolumePayloadWithId>(
    ({ volumeId, ...data }) => attachVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(
          [queryKey, 'paginated'],
          volume.id,
          volume,
          queryClient
        );
        if (volume.linode_id) {
          queryClient.invalidateQueries([queryKey, 'linode', volume.linode_id]);
        }
      },
    }
  );
};

export const useDetachVolumeMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => detachVolume(id));

export const volumeEventsHandler = ({
  event,
  queryClient,
}: EventHandlerData) => {
  if (['failed', 'finished', 'notification'].includes(event.status)) {
    queryClient.invalidateQueries([queryKey]);
  }

  if (
    event.action === 'volume_migrate' &&
    (event.status === 'finished' || event.status === 'failed')
  ) {
    // if a migration finishes, we want to re-request notifications so that the `volume_migration_imminent`
    // notification goes away.
    queryClient.invalidateQueries(accountQueries.notifications.queryKey);
  }

  if (event.action === 'volume_clone') {
    // The API gives us no way to know when a cloned volume transitions from
    // creating to active, so we will just refresh after 10 seconds
    setTimeout(() => {
      queryClient.invalidateQueries([queryKey]);
    }, 10000);
  }
};

const getAllVolumes = (passedParams: Params = {}, passedFilter: Filter = {}) =>
  getAll<Volume>((params, filter) =>
    getVolumes({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const getVolumesForLinode = (volumes: Volume[], linodeId: number) =>
  volumes.filter(({ linode_id }) => linode_id && linode_id === linodeId);

const getAllVolumeTypes = () =>
  getAll<PriceType>((params) => getVolumeTypes(params))().then(
    (data) => data.data
  );

export const useVolumeTypesQuery = () =>
  useQuery<PriceType[], APIError[]>([`${queryKey}-types`], getAllVolumeTypes, {
    ...queryPresets.oneTimeFetch,
  });
