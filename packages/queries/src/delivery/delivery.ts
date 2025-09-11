import {
  createDestination,
  createStream,
  deleteDestination,
  deleteStream,
  getDestination,
  getDestinations,
  getStream,
  getStreams,
  updateDestination,
  updateStream,
  verifyDestination,
} from '@linode/api-v4';
import { profileQueries } from '@linode/queries';
import { getAll } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  APIError,
  CreateDestinationPayload,
  CreateStreamPayload,
  Destination,
  Filter,
  Params,
  ResourcePage,
  Stream,
  UpdateDestinationPayloadWithId,
  UpdateStreamPayloadWithId,
} from '@linode/api-v4';
import type { GetAllData } from '@linode/utilities';

export const getAllDataStreams = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<Stream>((params, filter) =>
    getStreams({ ...params, ...passedParams }, { ...filter, ...passedFilter }),
  )();

export const getAllDestinations = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<Destination>((params, filter) =>
    getDestinations(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )();

export const deliveryQueries = createQueryKeys('delivery', {
  stream: (id: number) => ({
    queryFn: () => getStream(id),
    queryKey: [id],
  }),
  streams: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllDataStreams(params, filter),
        queryKey: [params, filter],
      }),
      infinite: (filter: Filter) => ({
        queryFn: ({ pageParam }) =>
          getStreams({ page: pageParam as number }, filter),
        queryKey: [filter],
      }),
      paginated: (params: Params, filter: Filter) => ({
        queryFn: () => getStreams(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  destination: (id: number) => ({
    queryFn: () => getDestination(id),
    queryKey: [id],
  }),
  destinations: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllDestinations(params, filter),
        queryKey: [params, filter],
      }),
      infinite: (filter: Filter) => ({
        queryFn: ({ pageParam }) =>
          getDestinations({ page: pageParam as number }, filter),
        queryKey: [filter],
      }),
      paginated: (params: Params, filter: Filter) => ({
        queryFn: () => getDestinations(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
});

export const useStreamsQuery = (params: Params = {}, filter: Filter = {}) =>
  useQuery<ResourcePage<Stream>, APIError[]>({
    ...deliveryQueries.streams._ctx.paginated(params, filter),
  });

export const useAllStreamsQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled = true,
) =>
  useQuery<GetAllData<Stream>, APIError[]>({
    ...deliveryQueries.streams._ctx.all(params, filter),
    enabled,
  });

export const useStreamsInfiniteQuery = (filter: Filter, enabled: boolean) => {
  return useInfiniteQuery<ResourcePage<Stream>, APIError[]>({
    ...deliveryQueries.streams._ctx.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });
};

export const useStreamQuery = (id: number) =>
  useQuery<Stream, APIError[]>({ ...deliveryQueries.stream(id) });

export const useCreateStreamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Stream, APIError[], CreateStreamPayload>({
    mutationFn: createStream,
    onSuccess(stream) {
      // Invalidate streams
      queryClient.invalidateQueries({
        queryKey: deliveryQueries.streams._ctx.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: deliveryQueries.streams._ctx.all._def,
      });

      // Set Stream in cache
      queryClient.setQueryData(
        deliveryQueries.stream(stream.id).queryKey,
        stream,
      );

      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });
    },
  });
};

export const useUpdateStreamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Stream, APIError[], UpdateStreamPayloadWithId>({
    mutationFn: ({ id, ...data }) => updateStream(id, data),
    onSuccess(stream) {
      // Invalidate streams
      queryClient.invalidateQueries({
        queryKey: deliveryQueries.streams._ctx.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: deliveryQueries.streams._ctx.all._def,
      });

      // Update stream in cache
      queryClient.setQueryData(
        deliveryQueries.stream(stream.id).queryKey,
        stream,
      );
    },
  });
};

export const useDeleteStreamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { id: number }>({
    mutationFn: ({ id }) => deleteStream(id),
    onSuccess(_, { id }) {
      // Invalidate streams
      queryClient.invalidateQueries({
        queryKey: deliveryQueries.streams._ctx.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: deliveryQueries.streams._ctx.all._def,
      });

      // Remove stream from the cache
      queryClient.removeQueries({
        queryKey: deliveryQueries.stream(id).queryKey,
      });
    },
  });
};

export const useAllDestinationsQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled = true,
) =>
  useQuery<GetAllData<Destination>, APIError[]>({
    ...deliveryQueries.destinations._ctx.all(params, filter),
    enabled,
  });

export const useDestinationsQuery = (
  params: Params = {},
  filter: Filter = {},
) =>
  useQuery<ResourcePage<Destination>, APIError[]>({
    ...deliveryQueries.destinations._ctx.paginated(params, filter),
  });

export const useDestinationsInfiniteQuery = (
  filter: Filter,
  enabled: boolean,
) => {
  return useInfiniteQuery<ResourcePage<Destination>, APIError[]>({
    ...deliveryQueries.destinations._ctx.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });
};

export const useDestinationQuery = (id: number) =>
  useQuery<Destination, APIError[]>({ ...deliveryQueries.destination(id) });

export const useCreateDestinationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Destination, APIError[], CreateDestinationPayload>({
    mutationFn: createDestination,
    onSuccess(destination) {
      // Invalidate destinations
      queryClient.invalidateQueries({
        queryKey: deliveryQueries.destinations._ctx.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: deliveryQueries.destinations._ctx.all._def,
      });

      // Set Destination in cache
      queryClient.setQueryData(
        deliveryQueries.destination(destination.id).queryKey,
        destination,
      );

      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });
    },
  });
};

export const useUpdateDestinationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Destination, APIError[], UpdateDestinationPayloadWithId>({
    mutationFn: ({ id, ...data }) => updateDestination(id, data),
    onSuccess(destination) {
      // Invalidate destinations
      queryClient.invalidateQueries({
        queryKey: deliveryQueries.destinations._ctx.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: deliveryQueries.destinations._ctx.all._def,
      });

      // Update destination in cache
      queryClient.setQueryData(
        deliveryQueries.destination(destination.id).queryKey,
        destination,
      );
    },
  });
};

export const useDeleteDestinationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { id: number }>({
    mutationFn: ({ id }) => deleteDestination(id),
    onSuccess(_, { id }) {
      // Invalidate destinations
      queryClient.invalidateQueries({
        queryKey: deliveryQueries.destinations._ctx.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: deliveryQueries.destinations._ctx.all._def,
      });

      // Remove stream from the cache
      queryClient.removeQueries({
        queryKey: deliveryQueries.destination(id).queryKey,
      });
    },
  });
};

export const useVerifyDestinationQuery = () => {
  return useMutation<Destination, APIError[], CreateDestinationPayload>({
    mutationFn: verifyDestination,
  });
};
