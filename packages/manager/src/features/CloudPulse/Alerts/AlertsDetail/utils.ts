import { transformDimensionValue } from '../Utils/utils';
import {
  LINODE_DIMENSION_LABEL,
  NODEBALANCER_DIMENSION_LABEL,
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
export interface ResolvedDimensionValueProps {
  /**
   *  The dimension label extracted from the Dimension Data.
   */
  dimensionFilterKey: string;
  /**
   * The dimension filter operator.
   */
  dimensionOperator: DimensionFilterOperatorType;
  /**
   * linode id to label map
   */
  linodeMap: Record<string, string>;
  /**
   * nodebalancer id to label map.
   */
  nodebalancersMap: Record<string, string>;
  /**
   * Service type of the alert.
   */
  serviceType: CloudPulseServiceType;
  /**
   * The dimension filter value to be resolved and transformed.
   */
  value: null | string | undefined;
  /**
   * vpc subent id to label map.
   */
  vpcSubnetMap: Record<string, string>;
}
/**
 * @returns string value with the resolved names for the dimension value and transformed.
 */
export const getResolvedDimensionValue = (
  props: ResolvedDimensionValueProps
): string => {
  const {
    dimensionFilterKey,
    dimensionOperator,
    linodeMap,
    serviceType,
    value,
    vpcSubnetMap,
    nodebalancersMap,
  } = props;
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

  if (
    dimensionFilterKey === NODEBALANCER_DIMENSION_LABEL &&
    transformationAllowedOperators.includes(dimensionOperator)
  ) {
    resolvedValue = resolveIds(value, nodebalancersMap);
  }

  return transformationAllowedOperators.includes(dimensionOperator)
    ? transformCommaSeperatedDimensionValues(
        resolvedValue,
        serviceType,
        dimensionFilterKey
      )
    : resolvedValue;
};
