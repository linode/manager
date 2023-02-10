import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getTags, Tag } from '@linode/api-v4';
import { queryClient, queryPresets } from './base';
import { getAll } from 'src/utilities/getAll';

export const queryKey = 'tags';

export const useTags = (enabled = true) =>
  useQuery<Tag[], APIError[]>(queryKey, getAllTags, {
    ...queryPresets.longLived,
    enabled,
  });

const getAllTags = (passedParams: any = {}, passedFilter: any = {}) =>
  getAll<Tag>((params, filter) =>
    getTags({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const updateTagsData = (newData: Tag[]): void => {
  const uniqueTags = Array.from(new Set(newData.map((tag) => tag.label)))
    .sort()
    .map((label) => ({ label }));
  queryClient.setQueryData(queryKey, uniqueTags);
};
