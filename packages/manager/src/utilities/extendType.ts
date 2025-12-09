import { formatStorageUnits, isNotNullOrUndefined } from '@linode/utilities';

import { LINODE_NETWORK_IN } from 'src/constants';
import { typeLabelDetails } from 'src/features/Linodes/presentation';

import type { APIError, LinodeType } from '@linode/api-v4';
import type { UseQueryResult } from '@tanstack/react-query';

export interface ExtendedType extends LinodeType {
  formattedLabel: string;
  heading: string;
  isDeprecated: boolean;
  subHeadings: string[];
}

export const extendType = (type: LinodeType): ExtendedType => {
  const {
    disk,
    label,
    memory,
    network_out,
    price: { hourly, monthly },
    transfer,
    vcpus,
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
    isDeprecated: type.successor !== null,
    subHeadings,
  };
};

export const extendTypesQueryResult = (
  results: UseQueryResult<LinodeType, APIError[]>[]
) =>
  results
    .map((result) => result.data)
    .filter(isNotNullOrUndefined)
    .map(extendType);
