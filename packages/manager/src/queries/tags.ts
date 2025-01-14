import {
  createTag,
  deleteTag,
  getTaggedObjects,
  getTags,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';

import type {
  APIError,
  Filter,
  Params,
  Tag,
  TaggedObject,
  TagRequest,
} from '@linode/api-v4';
import type { MutationOptions, QueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

const tagQueries = createQueryKeys('tags', {
  all: {
    queryFn: () => getAllTags(),
    queryKey: null,
  },
  tagObjects: (label: string) => ({
    queryFn: () => getAllTaggedObjected(label),
    queryKey: [label],
  }),
});

export const useAllTagsQuery = (enabled = true) =>
  useQuery<Tag[], APIError[]>({
    ...tagQueries.all,
    ...queryPresets.longLived,
    enabled,
  });

export const useTagObjectsQuery = (label: string) =>
  useQuery({
    ...tagQueries.tagObjects(label),
  });

export const useCreateTagMutation = (
  options?: MutationOptions<Tag, APIError[], TagRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<Tag, APIError[], TagRequest>({
    mutationFn: createTag,
    ...options,
    onSuccess(...params) {
      const newTag = params[0];
      queryClient.setQueryData<Tag[]>(tagQueries.all.queryKey, (tags) => {
        if (!tags) {
          return [newTag];
        }
        return [newTag, ...tags];
      });
      options?.onSuccess?.(...params);
    },
  });
};

export const useDeleteTagMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const query = queryOptions(tagQueries.all);

  return useMutation<{}, APIError[], string>({
    mutationFn: deleteTag,
    onError(errors) {
      for (const error of errors) {
        enqueueSnackbar(error.reason, {
          variant: 'error',
        });
      }
    },
    onSuccess(_, tag) {
      enqueueSnackbar(`Successfully deleted tag ${tag}`, {
        variant: 'success',
      });
      queryClient.setQueryData(
        query.queryKey,
        (tags) => tags?.filter((t) => t.label !== tag) ?? []
      );
    },
  });
};

const getAllTags = (passedParams: Params = {}, passedFilter: Filter = {}) =>
  getAll<Tag>((params, filter) =>
    getTags({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

const getAllTaggedObjected = (tag: string) =>
  getAll<TaggedObject>((params) => getTaggedObjects(tag, params))().then(
    (data) => data.data
  );

export const updateTagsSuggestionsData = (
  newData: Tag[],
  queryClient: QueryClient
): void => {
  const uniqueTags = Array.from(new Set(newData.map((tag) => tag.label)))
    .sort()
    .map((label) => ({ label }));
  queryClient.setQueryData(tagQueries.all.queryKey, uniqueTags);
};
