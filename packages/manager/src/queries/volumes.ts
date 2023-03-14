import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryClient, updateInPaginatedStore } from './base';
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

const queryKey = 'volumes' as const;

export const volumeQueryKeys = {
  invalidationKey: [queryKey] as const,
  all: {
    queryKey: (params: any, filter: any) =>
      [queryKey, 'all', params, filter] as const,
    invalidationKey: [queryKey, 'all'] as const,
  },
  paginated: {
    invalidationKey: [queryKey, 'paginated'] as const,
    all: {
      queryKey: (params: any, filter: any) =>
        [queryKey, 'paginated', 'all', params, filter] as const,
      invalidationKey: [queryKey, 'paginated'] as const,
    },
    forLinode: (linodeId: number) => ({
      queryKey: (params: any, filter: any) =>
        [queryKey, 'paginated', linodeId, params, filter] as const,
      invalidationKey: [queryKey, 'paginated', linodeId] as const,
    }),
  },
};

export const useVolumesQuery = (params: any, filters: any) =>
  useQuery<ResourcePage<Volume>, APIError[]>(
    volumeQueryKeys.paginated.all.queryKey(params, filters),
    () => getVolumes(params, filters),
    { keepPreviousData: true }
  );

export const useLinodeVolumesQuery = (
  linodeId: number,
  params: any = {},
  filters: any = {},
  enabled = true
) =>
  useQuery<ResourcePage<Volume>, APIError[]>(
    volumeQueryKeys.paginated.forLinode(linodeId).queryKey(params, filters),
    () => getLinodeVolumes(linodeId, params, filters),
    { keepPreviousData: true, enabled }
  );
export const useAllVolumesQuery = (
  params: any = {},
  filters: any = {},
  enabled = true
) =>
  useQuery<Volume[], APIError[]>(
    volumeQueryKeys.all.queryKey(params, filters),
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
        updateInPaginatedStore<Volume>(
          volumeQueryKeys.paginated.invalidationKey,
          volume.id,
          volume
        );
      },
    }
  );

export const useCloneVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & CloneVolumePayload>(
    ({ volumeId, ...data }) => cloneVolume(volumeId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries(
          volumeQueryKeys.paginated.invalidationKey
        );
      },
    }
  );

export const useDeleteVolumeMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => deleteVolume(id), {
    onSuccess() {
      queryClient.invalidateQueries(volumeQueryKeys.paginated.invalidationKey);
    },
  });

export const useCreateVolumeMutation = () =>
  useMutation<Volume, APIError[], VolumeRequestPayload>(createVolume, {
    onSuccess() {
      queryClient.invalidateQueries(volumeQueryKeys.paginated.invalidationKey);
    },
  });

export const useUpdateVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & UpdateVolumeRequest>(
    ({ volumeId, ...data }) => updateVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(
          volumeQueryKeys.paginated.invalidationKey,
          volume.id,
          volume
        );
      },
    }
  );

export const useAttachVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & AttachVolumePayload>(
    ({ volumeId, ...data }) => attachVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(
          volumeQueryKeys.paginated.invalidationKey,
          volume.id,
          volume
        );
        queryClient.invalidateQueries([
          volumeQueryKeys.paginated.forLinode(volume.linode_id!)
            .invalidationKey,
          'linode',
          volume.linode_id,
        ]);
      },
    }
  );

export const useDetachVolumeMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => detachVolume(id));

export const volumeEventsHandler = (event: Event) => {
  queryClient.invalidateQueries(queryKey);

  // Special case. Refetch volumes a while after a clone happens
  if (event.action === 'volume_clone') {
    setTimeout(() => {
      queryClient.invalidateQueries(queryKey);
    }, 10000);
  }
};

const getAllVolumes = (passedParams: any = {}, passedFilter: any = {}) =>
  getAll<Volume>((params, filter) =>
    getVolumes({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const getVolumesForLinode = (volumes: Volume[], linodeId: number) =>
  volumes.filter(({ linode_id }) => linode_id && linode_id === linodeId);
