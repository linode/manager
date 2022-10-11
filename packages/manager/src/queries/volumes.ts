import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { updateInPaginatedStore } from './base';
import {
  attachVolume,
  AttachVolumePayload,
  detachVolume,
  getVolumes,
  Volume,
  Event,
  UpdateVolumeRequest,
  updateVolume,
} from '@linode/api-v4';

const queryKey = 'volumes';

export const useVolumesQuery = (params: any, filters: any) =>
  useQuery<ResourcePage<Volume>, APIError[]>(
    [`${queryKey}-list`, params, filters],
    () => getVolumes(params, filters),
    { keepPreviousData: true }
  );

export const useUpdateVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & UpdateVolumeRequest>(
    ({ volumeId, ...data }) => updateVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(queryKey, volume.id, volume);
      },
    }
  );

export const useAttachVolumeMutation = () =>
  useMutation<Volume, APIError[], { volumeId: number } & AttachVolumePayload>(
    ({ volumeId, ...data }) => attachVolume(volumeId, data),
    {
      onSuccess(volume) {
        updateInPaginatedStore<Volume>(queryKey, volume.id, volume);
      },
    }
  );

export const useDetachVolumeMutation = () =>
  useMutation<{}, APIError[], { id: number }>(({ id }) => detachVolume(id));

export const volumeEventsHandler = (event: Event) => {
  const { action, entity } = event;

  switch (action) {
    case 'volume_create':
      return;
    case 'volume_attach':
      return;
    case 'volume_update':
      return;
    case 'volume_detach':
      updateInPaginatedStore<Volume>(queryKey, entity!.id, {
        linode_id: null,
        linode_label: null,
      });
      return;
    case 'volume_resize':
      return;
    case 'volume_clone':
      return;
    case 'volume_delete':
      return;
    case 'volume_migrate':
      return;
    default:
      return;
  }
};
