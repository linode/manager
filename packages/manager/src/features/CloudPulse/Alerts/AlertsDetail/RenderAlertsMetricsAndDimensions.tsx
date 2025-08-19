import { Divider } from '@linode/ui';
import { GridLegacy } from '@mui/material';
import React from 'react';

import NullComponent from 'src/components/NullComponent';

import {
  aggregationTypeMap,
  dimensionOperatorTypeMap,
  metricOperatorTypeMap,
} from '../constants';
import { DisplayAlertDetailChips } from './DisplayAlertDetailChips';
import { handleDimensionValue } from './utils';

import type {
  AlertDefinitionMetricCriteria,
  CloudPulseServiceType,
} from '@linode/api-v4';

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
                    transformationAllowedOperators.includes(dimensionOperator)
                      ? handleDimensionValue(
                          value,
                          serviceType,
                          dimensionFilterKey
                        )
                      : value,
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
