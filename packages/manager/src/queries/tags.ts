import { APIError, Filter, Params } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getTags, Tag } from '@linode/api-v4';
import { queryClient, queryPresets } from './base';
import { getAll } from 'src/utilities/getAll';

export const queryKey = 'tags';

export const useTagSuggestions = (enabled = true) =>
  useQuery<Tag[], APIError[]>(queryKey, () => getAllTagSuggestions(), {
    ...queryPresets.longLived,
    enabled,
  });

const getAllTagSuggestions = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Tag>((params, filter) =>
    getTags({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const updateTagsSuggestionsData = (newData: Tag[]): void => {
  const uniqueTags = Array.from(new Set(newData.map((tag) => tag.label)))
    .sort()
    .map((label) => ({ label }));
  queryClient.setQueryData(queryKey, uniqueTags);
};
