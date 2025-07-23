import {
  type APIError,
  createStream,
  getStream,
  getStreams,
} from '@linode/api-v4';
import { profileQueries } from '@linode/queries';
import { getAll } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateStreamPayload,
  Filter,
  Params,
  ResourcePage,
  Stream,
} from '@linode/api-v4';

export const getAllDataStreams = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<Stream>((params, filter) =>
    getStreams({ ...params, ...passedParams }, { ...filter, ...passedFilter }),
  )().then((data) => data.data);

export const datastreamQueries = createQueryKeys('datastream', {
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
      paginated: (params: Params, filter: Filter) => ({
        queryFn: () => getStreams(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  // @TODO (DPS-34038) destinations
});

export const useDataStreamsQuery = (params: Params = {}, filter: Filter = {}) =>
  useQuery<ResourcePage<Stream>, APIError[]>({
    ...datastreamQueries.streams._ctx.paginated(params, filter),
  });

export const useCreateStreamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Stream, APIError[], CreateStreamPayload>({
    mutationFn: createStream,
    onSuccess(stream) {
      // Invalidate paginated lists
      queryClient.invalidateQueries({
        queryKey: datastreamQueries.streams._ctx.paginated._def,
      });

      // Set Stream in cache
      queryClient.setQueryData(
        datastreamQueries.stream(stream.id).queryKey,
        stream,
      );

      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });
    },
  });
};
