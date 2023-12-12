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
  getVolumes,
  resizeVolume,
  updateVolume,
} from '@linode/api-v4';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { Filter, Params } from '@linode/api-v4/src/types';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { EventWithStore } from 'src/events';
import { getAll } from 'src/utilities/getAll';

import { updateInPaginatedStore } from './base';
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

export const useResizeVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Volume,
    APIError[],
    { volumeId: number } & ResizeVolumePayload
  >(({ volumeId, ...data }) => resizeVolume(volumeId, data), {
    onSuccess(volume) {
      updateInPaginatedStore<Volume>(
        [queryKey, 'paginated'],
        volume.id,
        volume,
        queryClient
      );
    },
  });
};

export const useCloneVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Volume,
    APIError[],
    { volumeId: number } & CloneVolumePayload
  >(({ volumeId, ...data }) => cloneVolume(volumeId, data), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
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

export const useUpdateVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Volume,
    APIError[],
    { volumeId: number } & UpdateVolumeRequest
  >(({ volumeId, ...data }) => updateVolume(volumeId, data), {
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
  });
};

export const useAttachVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Volume,
    APIError[],
    { volumeId: number } & AttachVolumePayload
  >(({ volumeId, ...data }) => attachVolume(volumeId, data), {
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
  });
};

export const useDetachVolumeMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => detachVolume(id));

export const volumeEventsHandler = ({ event, queryClient }: EventWithStore) => {
  if (['failed', 'finished', 'notification'].includes(event.status)) {
    queryClient.invalidateQueries([queryKey]);
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
