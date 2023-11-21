import { LinodeType, getLinodeTypes, getType } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import {
  QueryClient,
  UseQueryOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';

const queryKey = 'types';

const getAllTypes = () =>
  getAll(getLinodeTypes)().then((results) => results.data);

const getSingleType = async (type: string, queryClient: QueryClient) => {
  const allTypesCache = queryClient.getQueryData<LinodeType[]>(
    allTypesQueryKey
  );
  return (
    allTypesCache?.find((cachedType) => cachedType.id === type) ?? getType(type)
  );
};

const allTypesQueryKey = [queryKey, 'all'];
export const useAllTypes = (enabled = true) => {
  return useQuery<LinodeType[], APIError[]>(allTypesQueryKey, getAllTypes, {
    enabled,
    ...queryPresets.oneTimeFetch,
  });
};

const specificTypesQueryKey = (type: string) => [queryKey, 'detail', type];
/**
 * Some Linodes may have types that aren't returned by the /types and /types-legacy endpoints. This
 * hook may be useful in fetching these "shadow plans".
 */
export const useSpecificTypes = (types: string[], enabled = true) => {
  const queryClient = useQueryClient();
  return useQueries(
    types.map<UseQueryOptions<LinodeType, APIError[]>>((type) => ({
      enabled,
      queryFn: () => getSingleType(type, queryClient),
      queryKey: specificTypesQueryKey(type),
      ...queryPresets.oneTimeFetch,
    }))
  );
};

export const useTypeQuery = (type: string, enabled = true) => {
  return useQuery<LinodeType, APIError[]>({
    queryFn: () => getType(type),
    queryKey: specificTypesQueryKey(type),
    ...queryPresets.oneTimeFetch,
    enabled: enabled && Boolean(type),
  });
};
