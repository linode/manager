import {
  createImage,
  deleteImage,
  getImage,
  getImages,
  updateImage,
  updateImageRegions,
  uploadImage,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import { profileQueries } from './profile/profile';

import type {
  APIError,
  CreateImagePayload,
  Filter,
  Image,
  ImageUploadPayload,
  Params,
  ResourcePage,
  UpdateImageRegionsPayload,
  UploadImageResponse,
} from '@linode/api-v4';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { EventHandlerData } from 'src/hooks/useEventHandlers';

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

export const useImagesQuery = (
  params: Params,
  filters: Filter,
  options?: UseQueryOptions<ResourcePage<Image>, APIError[]>
) =>
  useQuery<ResourcePage<Image>, APIError[]>({
    ...imageQueries.paginated(params, filters),
    keepPreviousData: true,
    ...options,
  });

export const useImageQuery = (imageId: string, enabled = true) =>
  useQuery<Image, APIError[]>({
    ...imageQueries.image(imageId),
    enabled,
  });

export const useCreateImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Image, APIError[], CreateImagePayload>({
    mutationFn: createImage,
    onSuccess(image) {
      queryClient.invalidateQueries({
        queryKey: imageQueries.paginated._def,
      });
      queryClient.setQueryData<Image>(
        imageQueries.image(image.id).queryKey,
        image
      );
      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });
    },
  });
};

export const useUpdateImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Image,
    APIError[],
    { description?: string; imageId: string; label?: string; tags?: string[] }
  >({
    mutationFn: ({ description, imageId, label, tags }) =>
      updateImage(imageId, { description, label, tags }),
    onSuccess(image) {
      queryClient.invalidateQueries({
        queryKey: imageQueries.paginated._def,
      });
      queryClient.setQueryData<Image>(
        imageQueries.image(image.id).queryKey,
        image
      );
    },
  });
};

export const useDeleteImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { imageId: string }>({
    mutationFn: ({ imageId }) => deleteImage(imageId),
    onSuccess(_, variables) {
      queryClient.invalidateQueries({
        queryKey: imageQueries.paginated._def,
      });
      queryClient.removeQueries({
        queryKey: imageQueries.image(variables.imageId).queryKey,
      });
    },
  });
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

export const useUploadImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<UploadImageResponse, APIError[], ImageUploadPayload>({
    mutationFn: uploadImage,
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: imageQueries.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: imageQueries.all._def,
      });
      queryClient.setQueryData<Image>(
        imageQueries.image(data.image.id).queryKey,
        data.image
      );
    },
  });
};

export const useUpdateImageRegionsMutation = (imageId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Image, APIError[], UpdateImageRegionsPayload>({
    mutationFn: (data) => updateImageRegions(imageId, data),
    onSuccess(image) {
      queryClient.invalidateQueries({
        queryKey: imageQueries.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: imageQueries.all._def,
      });
      queryClient.setQueryData<Image>(
        imageQueries.image(image.id).queryKey,
        image
      );
    },
  });
};

export const imageEventsHandler = ({
  event,
  queryClient,
}: EventHandlerData) => {
  if (['failed', 'finished', 'notification'].includes(event.status)) {
    queryClient.invalidateQueries({
      queryKey: imageQueries.all._def,
    });
    queryClient.invalidateQueries({ queryKey: imageQueries.paginated._def });

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
      queryClient.invalidateQueries({
        queryKey: imageQueries.image(imageId).queryKey,
      });
    }
  }
};
