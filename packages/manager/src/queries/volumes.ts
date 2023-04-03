import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import {
  doesItemExistInPaginatedStore,
  getItemInPaginatedStore,
  queryClient,
  updateInPaginatedStore,
} from './base';
import {
  attachVolume,
  AttachVolumePayload,
  detachVolume,
  getVolumes,
  Volume,
  Event,
  UpdateVolumeRequest,
  updateVolume,
  ResizeVolumePayload,
  resizeVolume,
  cloneVolume,
  CloneVolumePayload,
  deleteVolume,
  VolumeRequestPayload,
  createVolume,
  getLinodeVolumes,
} from '@linode/api-v4';
import { Filter, Params } from '@linode/api-v4/src/types';

/**
 * For Volumes, we must maintain the following stores to keep our cache up to date.
 * When we manually mutate our cache, we must keep data under the following queryKeys up to date.
 *
 * Query Key Prefixes:
 * - `volumes-all` - Contains an array of all volumes
 *   - Only use this when absolutely necessary
 * - `volumes-list` - Contains ResourcePage of Paginated Volumes
 * - [`volumes-list`, 'linode', id] - Conatins Paginated Volumes for a Specifc Linode
 */

export const queryKey = 'volumes';

export const useVolumesQuery = (params: Params, filters: Filter) =>
  useQuery<ResourcePage<Volume>, APIError[]>(
    [`${queryKey}-list`, params, filters],
    () => getVolumes(params, filters),
    { keepPreviousData: true }
  );

export const useInfiniteVolumesQuery = (filter: any) =>
  useInfiniteQuery<ResourcePage<Volume>, APIError[]>(
    [queryKey, filter],
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

export const useLinodeVolumesQuery = (
  linodeId: number,
  params: Params = {},
  filters: Filter = {},
  enabled = true
) =>
  useQuery<ResourcePage<Volume>, APIError[]>(
    [`${queryKey}-list`, 'linode', linodeId, params, filters],
    () => getLinodeVolumes(linodeId, params, filters),
    { keepPreviousData: true, enabled }
  );
export const useAllVolumesQuery = (
  params: Params = {},
  filters: Filter = {},
  enabled = true
) =>
  useQuery<Volume[], APIError[]>(
    [`${queryKey}-all`, params, filters],
    () => getAllVolumes(params, filters),
    {
      enabled,
    }
  );

export const useResizeVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & ResizeVolumePayload>(
    ({ volumeId, ...data }) => resizeVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(`${queryKey}-list`, volume.id, volume);
      },
    }
  );

export const useCloneVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & CloneVolumePayload>(
    ({ volumeId, ...data }) => cloneVolume(volumeId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries(`${queryKey}-list`);
      },
    }
  );

export const useDeleteVolumeMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => deleteVolume(id), {
    onSuccess() {
      queryClient.invalidateQueries(`${queryKey}-list`);
    },
  });

export const useCreateVolumeMutation = () =>
  useMutation<Volume, APIError[], VolumeRequestPayload>(createVolume, {
    onSuccess() {
      queryClient.invalidateQueries(`${queryKey}-list`);
    },
  });

export const useUpdateVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & UpdateVolumeRequest>(
    ({ volumeId, ...data }) => updateVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(`${queryKey}-list`, volume.id, volume);
      },
    }
  );

export const useAttachVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & AttachVolumePayload>(
    ({ volumeId, ...data }) => attachVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(`${queryKey}-list`, volume.id, volume);
        queryClient.invalidateQueries([
          `${queryKey}-list`,
          'linode',
          volume.linode_id,
        ]);
      },
    }
  );

export const useDetachVolumeMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => detachVolume(id));

export const volumeEventsHandler = (event: Event) => {
  const { action, status, entity } = event;

  // Keep the getAll query up to date so that when we have to use it, it contains accurate data
  queryClient.invalidateQueries(`${queryKey}-all`);

  switch (action) {
    case 'volume_create':
      switch (status) {
        case 'started':
        case 'scheduled':
          return;
        case 'failed':
        case 'finished':
        case 'notification':
          queryClient.invalidateQueries(`${queryKey}-list`);
          return;
      }
    case 'volume_attach':
      switch (status) {
        case 'scheduled':
        case 'started':
        case 'notification':
          return;
        case 'finished':
          const volume = getItemInPaginatedStore<Volume>(
            `${queryKey}-list`,
            entity!.id
          );
          if (volume && volume.linode_id === null) {
            queryClient.invalidateQueries(`${queryKey}-list`);
          }
          return;
        case 'failed':
          // This means a attach was unsuccessful. Remove associated Linode.
          updateInPaginatedStore<Volume>(`${queryKey}-list`, entity!.id, {
            linode_id: null,
            linode_label: null,
          });
          return;
      }
    case 'volume_update':
      return;
    case 'volume_detach':
      switch (status) {
        case 'scheduled':
        case 'failed':
        case 'started':
          return;
        case 'notification':
        case 'finished':
          const volume = getItemInPaginatedStore<Volume>(
            `${queryKey}-list`,
            entity!.id
          );
          updateInPaginatedStore<Volume>(`${queryKey}-list`, entity!.id, {
            linode_id: null,
            linode_label: null,
          });
          if (volume && volume.linode_id !== null) {
            queryClient.invalidateQueries([
              `${queryKey}-list`,
              'linode',
              volume.linode_id,
            ]);
          }
          return;
      }
    case 'volume_resize':
      // This means a resize was successful. Transition from 'resizing' to 'active'.
      updateInPaginatedStore<Volume>(`${queryKey}-list`, entity!.id, {
        status: 'active',
      });
      return;
    case 'volume_clone':
      // This is very hacky, but we have no way to know when a cloned volume should transition
      // from 'creating' to 'active' so we will wait a bit after a volume is cloned, then refresh
      // and hopefully the volume is active.
      setTimeout(() => {
        queryClient.invalidateQueries(`${queryKey}-list`);
      }, 5000);
      return;
    case 'volume_delete':
      if (doesItemExistInPaginatedStore(`${queryKey}-list`, entity!.id)) {
        queryClient.invalidateQueries(`${queryKey}-list`);
      }
      return;
    case 'volume_migrate':
      return;
    default:
      return;
  }
};

const getAllVolumes = (passedParams: Params = {}, passedFilter: Filter = {}) =>
  getAll<Volume>((params, filter) =>
    getVolumes({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const getVolumesForLinode = (volumes: Volume[], linodeId: number) =>
  volumes.filter(({ linode_id }) => linode_id && linode_id === linodeId);
