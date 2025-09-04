import { transformDimensionValue } from '../Utils/utils';
import {
  LINODE_DIMENSION_LABEL,
  transformationAllowedOperators,
  VPC_SUBNET_DIMENSION_LABEL,
} from './constants';

import type {
  AlertDefinitionMetricCriteria,
  CloudPulseServiceType,
  DimensionFilterOperatorType,
} from '@linode/api-v4';
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

/**
 * @param value The dimension value to be resolved.
 * @param lookupMap The map used to resolve the dimension value.
 * @returns string value with the resolved names for the dimension value.
 */
export const resolveIds = (
  value: string,
  lookupMap: Record<string, string>
): string => {
  if (!value) return '';
  return value
    .split(',')
    .map((id) => {
      const trimmedId = id.trim();
      return lookupMap[trimmedId] ?? trimmedId;
    })
    .join(', ');
};

/**
 * @param ruleCriteria The rule criteria containing the alert definition metric criteria.
 * @param label The dimension label to check within the criteria.
 * @param transformationAllowedOperators The list of operators that allow transformation.
 * @returns boolean indicating if the check is required.
 */
export const isCheckRequired = (
  ruleCriteria: { rules: AlertDefinitionMetricCriteria[] },
  label: string
) => {
  return (
    ruleCriteria.rules?.some((rule) =>
      rule.dimension_filters?.some(
        ({ operator, dimension_label: dimensionLabel }) =>
          dimensionLabel === label &&
          transformationAllowedOperators.includes(operator ?? '')
      )
    ) ?? false
  );
};

/**
 * @param dimensionFilterKey The dimension label extracted from the Dimension Data.
 * @param dimensionOperator The dimension filter operator.
 * @param value The dimension filter value to be resolved and transformed.
 * @param serviceType Service type of the alert.
 * @param linodeMap linode id to label map
 * @param vpcSubnetMap vpc subent id to label map.
 * @returns string value with the resolved names for the dimension value and transformed.
 */
export const getResolvedDimensionValue = (
  dimensionFilterKey: string,
  dimensionOperator: DimensionFilterOperatorType,
  value: null | string | undefined,
  serviceType: CloudPulseServiceType,
  linodeMap: Record<string, string>,
  vpcSubnetMap: Record<string, string>
): string => {
  if (!value) return '';

  let resolvedValue = value;

  if (
    dimensionFilterKey === LINODE_DIMENSION_LABEL &&
    transformationAllowedOperators.includes(dimensionOperator)
  ) {
    resolvedValue = resolveIds(value, linodeMap);
  }

  if (
    dimensionFilterKey === VPC_SUBNET_DIMENSION_LABEL &&
    transformationAllowedOperators.includes(dimensionOperator)
  ) {
    resolvedValue = resolveIds(value, vpcSubnetMap);
  }

  return transformationAllowedOperators.includes(dimensionOperator)
    ? transformCommaSeperatedDimensionValues(
        resolvedValue,
        serviceType,
        dimensionFilterKey
      )
    : resolvedValue;
};
