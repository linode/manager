import {
  type AlertDefinitionMetricCriteria,
  type CloudPulseServiceType,
} from '@linode/api-v4';
import { useAllLinodesQuery, useAllVPCsQuery } from '@linode/queries';
import { Divider } from '@linode/ui';
import { GridLegacy } from '@mui/material';
import React, { useMemo } from 'react';

import NullComponent from 'src/components/NullComponent';

import {
  aggregationTypeMap,
  dimensionOperatorTypeMap,
  metricOperatorTypeMap,
} from '../constants';
import { getVPCSubnets } from '../CreateAlert/Criteria/DimensionFilterValue/utils';
import { DisplayAlertDetailChips } from './DisplayAlertDetailChips';
import { resolveIds, transformCommaSeperatedDimensionValues } from './utils';

const LINODE_DIMENSION_LABEL = 'linode_id';
const VPC_SUBNET_DIMENSION_LABEL = 'vpc_subnet_id';
interface AlertMetricAndDimensionsProp {
  /*
   * The rule criteria associated with the alert for which the dimension filters are needed to be displayed
   */
  ruleCriteria: {
    rules: AlertDefinitionMetricCriteria[];
  };
  /**
   * The service type of the alert for which the criteria needs to be displayed
   */
  serviceType: CloudPulseServiceType;
}

const transformationAllowedOperators = ['eq', 'neq', 'in'];
export const RenderAlertMetricsAndDimensions = React.memo(
  (props: AlertMetricAndDimensionsProp) => {
    const { ruleCriteria, serviceType } = props;
    const isCheckRequired = (label: string) => {
      return (
        ruleCriteria.rules?.some((rule) =>
          rule.dimension_filters?.some(
            (dimension) =>
              dimension.dimension_label === label &&
              transformationAllowedOperators.includes(dimension.operator ?? '')
          )
        ) ?? false
      );
    };
    const isLinodeRequired = isCheckRequired(LINODE_DIMENSION_LABEL);
    const isVPCRequired = isCheckRequired(VPC_SUBNET_DIMENSION_LABEL);
    // Initialize the query, but only run when needed
    const { data: linodes } = useAllLinodesQuery({}, {}, isLinodeRequired);

    const linodeMap = useMemo(
      () =>
        linodes?.reduce<Record<string, string>>((acc, linode) => {
          return {
            ...acc,
            [String(linode.id)]: linode.label,
          };
        }, {}) ?? {},
      [linodes]
    );

    const { data: vpcs } = useAllVPCsQuery({ enabled: isVPCRequired });
    const vpcSubnetMap = useMemo(() => {
      const subnets = getVPCSubnets(vpcs ?? []); // still returns Item<string, string>[]
      return subnets.reduce<Record<string, string>>((acc, { value, label }) => {
        return {
          ...acc,
          [value]: label,
        };
      }, {});
    }, [vpcs]);

    const getResolvedDimensionValue = (
      dimensionFilterKey: string,
      dimensionOperator: string,
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

    if (!ruleCriteria.rules?.length) {
      return <NullComponent />;
    }

    return ruleCriteria.rules.map(
      (
        {
          aggregate_function: aggregationType,
          dimension_filters: dimensionFilters,
          label,
          operator,
          threshold,
          unit,
        },
        index
      ) => (
        <React.Fragment key={`${label}_${index}`}>
          <GridLegacy item xs={12}>
            <DisplayAlertDetailChips // build the metric threshold chip like aggregation|label|metric_operator|threshold|unit
              label="Metric Threshold"
              mergeChips
              values={[
                aggregationTypeMap[aggregationType],
                label,
                metricOperatorTypeMap[operator],
                String(threshold),
                unit,
              ]}
            />
          </GridLegacy>

          {dimensionFilters && dimensionFilters.length > 0 && (
            <GridLegacy item xs={12}>
              <DisplayAlertDetailChips // build the dimensions associated with metric threshold like label|dimension_operator|value
                label="Dimension Filter"
                mergeChips
                values={dimensionFilters.map(
                  ({
                    label: dimensionLabel,
                    dimension_label: dimensionFilterKey,
                    operator: dimensionOperator,
                    value,
                  }) => [
                    dimensionLabel,
                    dimensionOperatorTypeMap[dimensionOperator],
                    getResolvedDimensionValue(
                      dimensionFilterKey,
                      operator,
                      value,
                      serviceType,
                      linodeMap,
                      vpcSubnetMap
                    ),
                  ]
                )}
              />
            </GridLegacy>
          )}
          <GridLegacy item xs={12}>
            <Divider />
          </GridLegacy>
        </React.Fragment>
      )
    );
  }
);
