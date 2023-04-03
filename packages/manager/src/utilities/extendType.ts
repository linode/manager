import { APIError, LinodeType } from '@linode/api-v4';
import { UseQueryResult } from 'react-query';
import { LINODE_NETWORK_IN } from 'src/constants';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import { formatStorageUnits } from './formatStorageUnits';
import { isNotNullOrUndefined } from './nullOrUndefined';

export interface ExtendedType extends LinodeType {
  heading: string;
  subHeadings: string[];
  isDeprecated: boolean;
  formattedLabel: string;
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
    formattedLabel,
    heading: formattedLabel,
    subHeadings,
    isDeprecated: type.successor !== null,
  };
};

export const extendTypesQueryResult = (
  results: UseQueryResult<LinodeType, APIError[]>[]
) =>
  results
    .map((result) => result.data)
    .filter(isNotNullOrUndefined)
    .map(extendType);
