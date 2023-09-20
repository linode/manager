import {
  CreateImagePayload,
  Image,
  ImageUploadPayload,
  UploadImageResponse,
  createImage,
  deleteImage,
  getImage,
  getImages,
  updateImage,
  uploadImage,
} from '@linode/api-v4';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { EventWithStore } from 'src/events';
import { getAll } from 'src/utilities/getAll';

import { doesItemExistInPaginatedStore, updateInPaginatedStore } from './base';
import { queryKey as PROFILE_QUERY_KEY } from './profile';

export const queryKey = 'images';

export const useImagesQuery = (params: Params, filters: Filter) =>
  useQuery<ResourcePage<Image>, APIError[]>(
    [`${queryKey}-list`, params, filters],
    () => getImages(params, filters),
    { keepPreviousData: true }
  );

// Get specific Image
export const useImageQuery = (imageID: string, enabled = true) =>
  useQuery<Image, APIError[]>([queryKey, imageID], () => getImage(imageID), {
    enabled,
  });

// Create Image
export const useCreateImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Image, APIError[], CreateImagePayload>(
    ({ cloud_init, description, diskID, label }) => {
      return createImage(diskID, label, description, cloud_init);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(`${queryKey}-list`);
        // If a restricted user creates an entity, we must make sure grants are up to date.
        queryClient.invalidateQueries([PROFILE_QUERY_KEY, 'grants']);
      },
    }
  );
};

// Update Image
export const useUpdateImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Image,
    APIError[],
    { description?: string; imageId: string; label?: string }
  >(
    ({ description, imageId, label }) =>
      updateImage(imageId, label, description),
    {
      onSuccess(image) {
        updateInPaginatedStore<Image>(
          `${queryKey}-list`,
          image.id,
          image,
          queryClient
        );
      },
    }
  );
};

// Delete Image
export const useDeleteImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { imageId: string }>(
    ({ imageId }) => deleteImage(imageId),
    {
      onSuccess() {
        queryClient.invalidateQueries(`${queryKey}-list`);
      },
    }
  );
};

// Remove Image from cache
export const removeImageFromCache = (queryClient: QueryClient) =>
  queryClient.invalidateQueries(`${queryKey}-list`);

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
    [`${queryKey}-all`, params, filters],
    () => getAllImages(params, filters),
    {
      enabled,
    }
  );

export const useUploadImageQuery = (payload: ImageUploadPayload) =>
  useMutation<UploadImageResponse, APIError[]>(() => uploadImage(payload));

export const imageEventsHandler = ({ event, queryClient }: EventWithStore) => {
  const { action, entity, status } = event;

  // Keep the getAll query up to date so that when we have to use it, it contains accurate data
  queryClient.invalidateQueries(`${queryKey}-all`);

  switch (action) {
    case 'image_delete':
      if (
        doesItemExistInPaginatedStore(
          `${queryKey}-list`,
          entity!.id,
          queryClient
        )
      ) {
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
          {},
          queryClient
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
          },
          queryClient
        );
        return;
      }

    case 'image_upload':
      if (event.status === 'finished') {
        // eslint-disable-next-line no-unused-expressions
        (async () =>
          await getImage(`private/${event.entity?.id}`).then(() => {
            updateInPaginatedStore<Image>(
              `${queryKey}-list`,
              `private/${event.entity?.id}`,
              {
                status: 'available',
              },
              queryClient
            );
          }))();
      }

    default:
      return;
  }
};
