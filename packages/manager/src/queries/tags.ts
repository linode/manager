import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getTags, Tag } from '@linode/api-v4';
import { queryClient, queryPresets } from './base';
import { getAll } from 'src/utilities/getAll';

export const queryKey = 'tags';

export const useTags = () =>
  useQuery<Tag[], APIError[]>(queryKey, getAllTags, {
    ...queryPresets.oneTimeFetch,
  });

const getAllTags = (passedParams: any = {}, passedFilter: any = {}) =>
  getAll<Tag>((params, filter) =>
    getTags({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const updateTagsData = (newData: Tag[]): void => {
  queryClient.setQueryData(queryKey, newData);
};
