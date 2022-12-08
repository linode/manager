import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { queryClient, updateInPaginatedStore } from './base';
import {
  Image,
  getImage,
  getImages,
  CreateImagePayload,
  // ImageUploadPayload,
  createImage,
  updateImage,
  deleteImage,
  // uploadImage,
} from '@linode/api-v4/lib/images';

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
        updateInPaginatedStore<Image>(
          `${queryKey}-list`,
          Number(image.id),
          image
        );
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
export const removeImageFromCache = (imageId: number | string) =>
  updateInPaginatedStore<Image>(`${queryKey}-list`, Number(imageId), {});
