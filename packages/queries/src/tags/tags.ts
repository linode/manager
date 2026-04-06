import { getTags } from '@linode/api-v4';
import { getAll } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';

import type { APIError, Filter, Params, Tag } from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';

const tagQueries = createQueryKeys('tags', {
  all: {
    queryFn: () => getAllTags(),
    queryKey: null,
  },
});

export const useAllTagsQuery = (enabled = true) =>
  useQuery<Tag[], APIError[]>({
    ...tagQueries.all,
    ...queryPresets.longLived,
    enabled,
  });

const getAllTags = (passedParams: Params = {}, passedFilter: Filter = {}) =>
  getAll<Tag>((params, filter) =>
    getTags({ ...params, ...passedParams }, { ...filter, ...passedFilter }),
  )().then((data) => data.data);

export const updateTagsSuggestionsData = (
  newData: Tag[],
  queryClient: QueryClient,
): void => {
  const uniqueTags = Array.from(new Set(newData.map((tag) => tag.label)))
    .sort()
    .map((label) => ({ label }));
  queryClient.setQueryData(tagQueries.all.queryKey, uniqueTags);
};
