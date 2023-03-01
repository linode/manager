import {
  getDeprecatedLinodeTypes,
  getLinodeTypes,
  getType,
  LinodeType,
} from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import { difference } from 'ramda';
import { useQuery } from 'react-query';
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
  isShadowPlan?: boolean;
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

/**
 * Get all Linode types, including legacy types and those specified in `linodeTypes` which aren't
 * returned by the /types and /types-legacy endpoints.
 */
const getAllTypes = async (linodeTypes: string[] = []) => {
  const [{ data: types }, { data: legacyTypes }] = await Promise.all([
    getAll<LinodeType>(getLinodeTypes)(),
    getAll<LinodeType>(getDeprecatedLinodeTypes)(),
  ]);
  const knownTypes = [...types, ...legacyTypes];

  // Try to fetch any of the specified types which weren't returned from the call above.
  const shadowTypeIds = difference(
    linodeTypes,
    knownTypes.map((type) => type.id)
  );
  const shadowTypes = await Promise.all(
    shadowTypeIds.map((id) => getType(id).catch()) // swallow errors
  );

  const allTypes = [...knownTypes, ...shadowTypes];
  return allTypes.map(extendType);
};

/**
 * Some Linodes may have types that aren't returned by the /types and /types-legacy endpoints. If a
 * type specified in `linodeTypes` isn't returned by these endpoints, an attempt will be made to
 * fetch them individually.
 */
export const useTypes = (linodeTypes: (string | null)[] = []) =>
  useQuery<ExtendedType[], APIError[]>(
    [queryKey, ...linodeTypes],
    () => getAllTypes(linodeTypes.filter((type) => type !== null) as string[]),
    {
      ...queryPresets.oneTimeFetch,
    }
  );
