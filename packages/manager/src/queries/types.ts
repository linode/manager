import { getLinodeTypes, getType, LinodeType } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import {
  QueryClient,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryPresets } from './base';

const queryKey = 'types';
const queryKeySpecificTypes = queryKey + '-specificTypes';

const getAllTypes = () =>
  getAll(getLinodeTypes)().then((results) => results.data);

const getSingleType = async (type: string, queryClient: QueryClient) => {
  const allTypesCache = queryClient.getQueryData<LinodeType[]>(queryKey);
  return (
    allTypesCache?.find((cachedType) => cachedType.id === type) ?? getType(type)
  );
};

export const useAllTypes = (enabled = true) => {
  return useQuery<LinodeType[], APIError[]>([queryKey], getAllTypes, {
    enabled,
    ...queryPresets.oneTimeFetch,
  });
};

/**
 * Some Linodes may have types that aren't returned by the /types and /types-legacy endpoints. This
 * hook may be useful in fetching these "shadow plans".
 */
export const useSpecificTypes = (types: string[], enabled = true) => {
  const queryClient = useQueryClient();
  return useQueries(
    types.map<UseQueryOptions<LinodeType, APIError[]>>((type) => ({
      queryKey: [queryKeySpecificTypes, type],
      queryFn: () => getSingleType(type, queryClient),
      enabled,
      ...queryPresets.oneTimeFetch,
    }))
  );
};
