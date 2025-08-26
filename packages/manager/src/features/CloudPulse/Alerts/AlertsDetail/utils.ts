import { transformDimensionValue } from '../Utils/utils';

import type { CloudPulseServiceType } from '@linode/api-v4';
/**
 * @param value The dimension value to be transformed.
 * @param serviceType The service type of the alert required for the transformation.
 * @param dimensionLabel The dimnsion label used to determine the transformation logic.
 * @returns string value with proper capitalization based on the service type and dimension label.
 */
export const transformCommaSeperatedDimensionValues = (
  value: string,
  serviceType: CloudPulseServiceType,
  dimensionLabel: string
) => {
  // Split the value by commas and trim whitespace from each part
  return value
    .split(',')
    .map((part) =>
      transformDimensionValue(serviceType, dimensionLabel, part.trim())
    )
    .join(', ');
};
