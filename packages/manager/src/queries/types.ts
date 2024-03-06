import {
  LinodeType,
  getLinodeTypes,
  getNodeBalancerTypes,
  getType,
} from '@linode/api-v4';
import { APIError, PriceType } from '@linode/api-v4/lib/types';
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
 *
 * Always returns an array of the same length of the `types` argument.
 */
export const useSpecificTypes = (types: string[], enabled = true) => {
  const queryClient = useQueryClient();
  return useQueries({
    queries: types.map<UseQueryOptions<LinodeType, APIError[]>>((type) => ({
      enabled: Boolean(type) && enabled,
      queryFn: () => getSingleType(type, queryClient),
      queryKey: specificTypesQueryKey(type),
      ...queryPresets.oneTimeFetch,
    })),
  });
};

export const useTypeQuery = (type: string, enabled = true) => {
  return useSpecificTypes([type], enabled)[0];
};

const getAllNodeBalancerTypes = () =>
  getAll<PriceType>((params) => getNodeBalancerTypes(params))().then(
    (results) => results.data
  );

export const useNodeBalancerTypesQuery = () =>
  useQuery<PriceType[], APIError[]>(
    [`${queryKey}-nodebalancers`],
    getAllNodeBalancerTypes,
    {
      ...queryPresets.oneTimeFetch,
    }
  );
