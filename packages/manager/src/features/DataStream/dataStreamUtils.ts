import { destinationTypeOptions } from 'src/features/DataStream/Shared/types';

import type { DestinationTypeOption } from 'src/features/DataStream/Shared/types';

export const getDestinationTypeOption = (
  destinationTypeValue: string
): DestinationTypeOption | undefined =>
  destinationTypeOptions.find(({ value }) => value === destinationTypeValue);
