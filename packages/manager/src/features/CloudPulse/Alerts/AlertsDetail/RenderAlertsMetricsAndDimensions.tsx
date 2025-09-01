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
    const needsLinodesCheck = () => {
      return (
        ruleCriteria.rules?.some((rule) =>
          rule.dimension_filters?.some(
            (dimension) =>
              dimension.dimension_label === 'linode_id' &&
              transformationAllowedOperators.includes(dimension.operator ?? '')
          )
        ) ?? false
      );
    };

    const needsVPCsCheck = () => {
      return (
        ruleCriteria.rules?.some((rule) =>
          rule.dimension_filters?.some(
            (dimension) =>
              dimension.dimension_label === 'vpc_subnet_id' &&
              transformationAllowedOperators.includes(dimension.operator ?? '')
          )
        ) ?? false
      );
    };

    const needsLinodes = needsLinodesCheck();
    const needsVPCs = needsVPCsCheck();
    // Initialize the query, but only run when needed
    const { data: linodes } = useAllLinodesQuery({}, {}, needsLinodes);

    const linodeMap = useMemo(
      () =>
        linodes?.reduce<Record<string, string>>((acc, linode) => {
          acc[String(linode.id)] = linode.label;
          return acc;
        }, {}) ?? {},
      [linodes]
    );

    const { data: vpcs } = useAllVPCsQuery({ enabled: needsVPCs });
    const vpcSubnetMap = useMemo(() => {
      const subnets = getVPCSubnets(vpcs ?? []); // still returns Item<string, string>[]
      return subnets.reduce<Record<string, string>>((acc, { value, label }) => {
        acc[value] = label;
        return acc;
      }, {});
    }, [vpcs]);

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
                  }) => {
                    let resolvedValue = value;
                    if (
                      dimensionFilterKey === 'linode_id' &&
                      transformationAllowedOperators.includes(dimensionOperator)
                    ) {
                      resolvedValue = resolveIds(value ?? '', linodeMap);
                    }
                    if (
                      dimensionFilterKey === 'vpc_subnet_id' &&
                      transformationAllowedOperators.includes(dimensionOperator)
                    ) {
                      resolvedValue = resolveIds(value ?? '', vpcSubnetMap);
                    }
                    // Pass the resolved value into transformDimensionValue
                    const displayValue =
                      transformationAllowedOperators.includes(dimensionOperator)
                        ? transformCommaSeperatedDimensionValues(
                            resolvedValue,
                            serviceType,
                            dimensionFilterKey
                          )
                        : resolvedValue;
                    return [
                      dimensionLabel,
                      dimensionOperatorTypeMap[dimensionOperator],
                      displayValue,
                    ];
                  }
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
