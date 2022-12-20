import {
  // ImageUploadPayload,
  createImage,
  CreateImagePayload,
  deleteImage,
  // uploadImage,
  Event,
  getImage,
  getImages,
  Image,
  updateImage,
} from '@linode/api-v4';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import {
  doesItemExistInPaginatedStore,
  queryClient,
  updateInPaginatedStore,
} from './base';

export const queryKey = 'images';

export const useImagesQuery = (params: any, filters: any) =>
  useQuery<ResourcePage<Image>, APIError[]>(
    [`${queryKey}-list`, params, filters],
    () => getImages(params, filters),
    { keepPreviousData: true }
  );

// Get specific Image
export const useSingleImageQuery = (imageID: string) =>
  useQuery<Image, APIError[]>([queryKey, imageID], () => getImage(imageID));

// Create Image
export const useCreateImageMutation = () => {
  return useMutation<Image, APIError[], CreateImagePayload>(
    ({ diskID, label, description }) => {
      return createImage(diskID, label, description);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(`${queryKey}-list`);
      },
    }
  );
};

// Update Image
export const useUpdateImageMutation = () =>
  useMutation<
    Image,
    APIError[],
    { imageId: string; label?: string; description?: string }
  >(
    ({ imageId, label, description }) =>
      updateImage(imageId, label, description),
    {
      onSuccess(image) {
        updateInPaginatedStore<Image>(`${queryKey}-list`, image.id, image);
      },
    }
  );

// Delete Image
export const useDeleteImageMutation = () =>
  useMutation<{}, APIError[], { imageId: string }>(
    ({ imageId }) => deleteImage(imageId),
    {
      onSuccess() {
        queryClient.invalidateQueries(`${queryKey}-list`);
      },
    }
  );

// Remove Image from cache
export const removeImageFromCache = () =>
  queryClient.invalidateQueries(`${queryKey}-list`);

export const imageEventsHandler = (event: Event) => {
  const { action, status, entity } = event;

  switch (action) {
    case 'image_delete':
      if (doesItemExistInPaginatedStore(`${queryKey}-list`, entity!.id)) {
        queryClient.invalidateQueries(`${queryKey}-list`);
      }
      return;

    /**
     * Not ideal, but we don't have a choice: disk_imagize entity is the Linode
     * where the disk resides, not the image (as one would expect).
     */
    case 'disk_imagize':
      if (status === 'failed' && event.secondary_entity) {
        updateInPaginatedStore<Image>(
          `${queryKey}-list`,
          event.secondary_entity.id,
          {}
        );
        return;
      }

      if (
        ['finished', 'notification'].includes(status) &&
        event.secondary_entity
      ) {
        updateInPaginatedStore<Image>(
          `${queryKey}-list`,
          `private/${event.secondary_entity.id}`,
          {
            status: 'available',
          }
        );
        return;
      }

    default:
      return;
  }
};
