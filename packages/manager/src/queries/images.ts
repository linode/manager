import {
  ImageUploadPayload,
  createImage,
  CreateImagePayload,
  deleteImage,
  uploadImage,
  Event,
  getImage,
  getImages,
  Image,
  updateImage,
  UploadImageResponse,
} from '@linode/api-v4';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from './base';
import { getAll } from 'src/utilities/getAll';

export const queryKey = 'images';

export const useImagesQuery = (params: Params, filters: Filter) =>
  useQuery<ResourcePage<Image>, APIError[]>(
    [queryKey, 'paginated', params, filters],
    () => getImages(params, filters),
    { keepPreviousData: true }
  );

// Get specific Image
export const useImageQuery = (imageID: string) =>
  useQuery<Image, APIError[]>([queryKey, imageID], () => getImage(imageID));

// Create Image
export const useCreateImageMutation = () => {
  return useMutation<Image, APIError[], CreateImagePayload>(
    ({ diskID, label, description }) => {
      return createImage(diskID, label, description);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
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
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );

// Delete Image
export const useDeleteImageMutation = () =>
  useMutation<{}, APIError[], { imageId: string }>(
    ({ imageId }) => deleteImage(imageId),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );

// Remove Image from cache
export const removeImageFromCache = () =>
  queryClient.invalidateQueries([queryKey]);

// Get all Images
export const getAllImages = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Image>((params, filter) =>
    getImages({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const useAllImagesQuery = (
  params: Params = {},
  filters: Filter = {},
  enabled = true
) =>
  useQuery<Image[], APIError[]>(
    [queryKey, 'all', params, filters],
    () => getAllImages(params, filters),
    {
      enabled,
    }
  );

export const useUploadImageQuery = (payload: ImageUploadPayload) =>
  useMutation<UploadImageResponse, APIError[]>(() => uploadImage(payload));

export const imageEventsHandler = (event: Event) => {
  const { status } = event;

  if (['notification', 'failed', 'finished'].includes(status)) {
    queryClient.invalidateQueries([queryKey]);
  }
};
