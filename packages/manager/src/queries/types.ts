import {
  getDeprecatedLinodeTypes,
  getLinodeTypes,
  getType,
  LinodeType,
} from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import {
  QueryClient,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import { LINODE_NETWORK_IN } from 'src/constants';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { getAll } from 'src/utilities/getAll';
import { queryPresets } from './base';

export const queryKey = 'types';

export interface ExtendedType extends LinodeType {
  heading: string;
  subHeadings: string[];
  isDeprecated: boolean;
}

export const extendType = (type: LinodeType): ExtendedType => {
  const {
    label,
    memory,
    vcpus,
    disk,
    network_out,
    transfer,
    price: { monthly, hourly },
  } = type;
  const formattedLabel = formatStorageUnits(label);

  const subHeadings = [
    `$${monthly}/mo ($${hourly}/hr)`,
    typeLabelDetails(memory, disk, vcpus),
    `${transfer / 1000} TB Transfer`,
  ];

  if (network_out > 0) {
    subHeadings.push(
      `${LINODE_NETWORK_IN} Gbps In / ${network_out / 1000} Gbps Out`
    );
  }

  return {
    ...type,
    label: formattedLabel,
    heading: formattedLabel,
    subHeadings,
    isDeprecated: type.successor !== null,
  };
};

const getAllTypes = () =>
  Promise.all([
    getAll<LinodeType>(getLinodeTypes)(),
    getAll<LinodeType>(getDeprecatedLinodeTypes)(),
  ])
    .then(([{ data: types }, { data: legacyTypes }]) => [
      ...types,
      ...legacyTypes,
    ])
    .then((allTypes) => allTypes.map(extendType));

const getSingleType = async (type: string, queryClient: QueryClient) => {
  const allTypesCache = queryClient.getQueryData<ExtendedType[]>(queryKey);
  return (
    allTypesCache?.find((cachedType) => cachedType.id === type) ??
    getType(type).then(extendType)
  );
};

export const useAllTypes = () =>
  useQuery<ExtendedType[], APIError[]>(queryKey, getAllTypes, {
    ...queryPresets.oneTimeFetch,
  });

/**
 * Some Linodes may have types that aren't returned by the /types and /types-legacy endpoints. This
 * hook may be useful in fetching these "shadow plans".
 */
export const useSpecificTypes = (types: string[]) => {
  const queryClient = useQueryClient();
  return useQueries(
    types.map<UseQueryOptions<ExtendedType, APIError[]>>((type) => ({
      queryKey: [queryKey, type],
      queryFn: () => getSingleType(type, queryClient),
      ...queryPresets.oneTimeFetch,
    }))
  );
};
