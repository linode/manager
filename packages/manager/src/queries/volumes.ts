import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { getAll } from 'src/utilities/getAll';
import { queryClient } from './base';
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
    [queryKey, 'paginated', params, filters],
    () => getVolumes(params, filters),
    { keepPreviousData: true }
  );

export const useInfiniteVolumesQuery = (filter: any) =>
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

export const useLinodeVolumesQuery = (
  linodeId: number,
  params: Params = {},
  filters: Filter = {},
  enabled = true
) =>
  useQuery<ResourcePage<Volume>, APIError[]>(
    [queryKey, 'linode', linodeId, params, filters],
    () => getLinodeVolumes(linodeId, params, filters),
    { keepPreviousData: true, enabled }
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

export const useResizeVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & ResizeVolumePayload>(
    ({ volumeId, ...data }) => resizeVolume(volumeId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );

export const useCloneVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & CloneVolumePayload>(
    ({ volumeId, ...data }) => cloneVolume(volumeId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );

export const useDeleteVolumeMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => deleteVolume(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });

export const useCreateVolumeMutation = () =>
  useMutation<Volume, APIError[], VolumeRequestPayload>(createVolume, {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });

export const useUpdateVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & UpdateVolumeRequest>(
    ({ volumeId, ...data }) => updateVolume(volumeId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );

export const useAttachVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & AttachVolumePayload>(
    ({ volumeId, ...data }) => attachVolume(volumeId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );

export const useDetachVolumeMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => detachVolume(id));

export const volumeEventsHandler = (event: Event) => {
  const { status } = event;

  if (['notification', 'failed', 'finished'].includes(status)) {
    queryClient.invalidateQueries([queryKey]);
  }
};

const getAllVolumes = (passedParams: Params = {}, passedFilter: Filter = {}) =>
  getAll<Volume>((params, filter) =>
    getVolumes({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const getVolumesForLinode = (volumes: Volume[], linodeId: number) =>
  volumes.filter(({ linode_id }) => linode_id && linode_id === linodeId);
