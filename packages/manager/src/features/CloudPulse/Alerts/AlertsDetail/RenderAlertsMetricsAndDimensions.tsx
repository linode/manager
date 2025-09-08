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
import {
  LINODE_DIMENSION_LABEL,
  VPC_SUBNET_DIMENSION_LABEL,
} from './constants';
import { DisplayAlertDetailChips } from './DisplayAlertDetailChips';
import { getResolvedDimensionValue, isCheckRequired } from './utils';

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

export const RenderAlertMetricsAndDimensions = React.memo(
  (props: AlertMetricAndDimensionsProp) => {
    const { ruleCriteria, serviceType } = props;

    const isLinodeRequired = isCheckRequired(
      ruleCriteria,
      LINODE_DIMENSION_LABEL
    );
    const isVPCRequired = isCheckRequired(
      ruleCriteria,
      VPC_SUBNET_DIMENSION_LABEL
    );
    // Initialize the query, but only run when needed
    const { data: linodes } = useAllLinodesQuery({}, {}, isLinodeRequired);
    const { data: vpcs } = useAllVPCsQuery({ enabled: isVPCRequired });

    // create a map of id to labels for lookup
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

    const vpcSubnetMap = useMemo(() => {
      const subnets = getVPCSubnets(vpcs ?? []); // still returns Item<string, string>[]
      return subnets.reduce<Record<string, string>>((acc, { value, label }) => {
        return {
          ...acc,
          [value]: label,
        };
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
                  }) => [
                    dimensionLabel,
                    dimensionOperatorTypeMap[dimensionOperator],
                    getResolvedDimensionValue(
                      dimensionFilterKey,
                      dimensionOperator,
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
