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
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EventHandlerData } from 'src/hooks/useEventHandlers';
import { getAll } from 'src/utilities/getAll';

import { profileQueries } from './profile';

export const getAllImages = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Image>((params, filter) =>
    getImages({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const imageQueries = createQueryKeys('images', {
  all: (params: Params = {}, filters: Filter = {}) => ({
    queryFn: () => getAllImages(params, filters),
    queryKey: [params, filters],
  }),
  image: (imageId: string) => ({
    queryFn: () => getImage(imageId),
    queryKey: [imageId],
  }),
  paginated: (params: Params, filters: Filter) => ({
    queryFn: () => getImages(params, filters),
    queryKey: [params, filters],
  }),
});

export const useImagesQuery = (params: Params, filters: Filter) =>
  useQuery<ResourcePage<Image>, APIError[]>({
    ...imageQueries.paginated(params, filters),
    keepPreviousData: true,
  });

export const useImageQuery = (imageId: string, enabled = true) =>
  useQuery<Image, APIError[]>({
    ...imageQueries.image(imageId),
    enabled,
  });

export const useCreateImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Image, APIError[], CreateImagePayload>({
    mutationFn: ({ cloud_init, description, diskID, label }) => {
      return createImage(diskID, label, description, cloud_init);
    },
    onSuccess(image) {
      queryClient.invalidateQueries(imageQueries.paginated._def);
      queryClient.setQueryData<Image>(
        imageQueries.image(image.id).queryKey,
        image
      );
      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries(profileQueries.grants.queryKey);
    },
  });
};

export const useUpdateImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Image,
    APIError[],
    { description?: string; imageId: string; label?: string }
  >({
    mutationFn: ({ description, imageId, label }) =>
      updateImage(imageId, label, description),
    onSuccess(image) {
      queryClient.invalidateQueries(imageQueries.paginated._def);
      queryClient.setQueryData<Image>(
        imageQueries.image(image.id).queryKey,
        image
      );
    },
  });
};

export const useDeleteImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { imageId: string }>(
    ({ imageId }) => deleteImage(imageId),
    {
      onSuccess(_, variables) {
        queryClient.invalidateQueries(imageQueries.paginated._def);
        queryClient.removeQueries(
          imageQueries.image(variables.imageId).queryKey
        );
      },
    }
  );
};

export const useAllImagesQuery = (
  params: Params = {},
  filters: Filter = {},
  enabled = true
) =>
  useQuery<Image[], APIError[]>({
    ...imageQueries.all(params, filters),
    enabled,
  });

export const useUploadImageMutation = (payload: ImageUploadPayload) =>
  useMutation<UploadImageResponse, APIError[]>({
    mutationFn: () => uploadImage(payload),
  });

export const imageEventsHandler = ({
  event,
  queryClient,
}: EventHandlerData) => {
  if (['failed', 'finished', 'notification'].includes(event.status)) {
    queryClient.invalidateQueries(imageQueries.all._def);
    queryClient.invalidateQueries(imageQueries.paginated._def);

    if (event.entity) {
      /*
       * Image event entities look like this:
       * "entity": {
       *   "label": "test-1",
       *   "id": 23802090,
       *   "type": "image",
       *   "url": "/v4/images/private/23802090"
       * },
       */

      const imageId = `private/${event.entity.id}`;
      queryClient.invalidateQueries(imageQueries.image(imageId).queryKey);
    }
  }
};
