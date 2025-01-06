import { Divider, Grid } from '@mui/material';
import React from 'react';

import NullComponent from 'src/components/NullComponent';

import {
  aggregationTypeMap,
  dimensionOperatorTypeMap,
  metricOperatorTypeMap,
} from '../constants';
import { DisplayAlertDetailChips } from './DisplayAlertDetailChips';

import type { AlertDefinitionMetricCriteria } from '@linode/api-v4';

interface AlertMetricAndDimensionsProp {
  /*
   * The rule criteria associated with the alert for which the dimension filters are needed to be displayed
   */
  ruleCriteria: {
    rules: AlertDefinitionMetricCriteria[];
  };
}

export const RenderAlertMetricsAndDimensions = React.memo(
  (props: AlertMetricAndDimensionsProp) => {
    const { ruleCriteria } = props;

    if (!ruleCriteria.rules?.length) {
      return <NullComponent />;
    }

    return ruleCriteria.rules.map(
      (
        {
          aggregation_type: aggregationType,
          dimension_filters: dimensionFilters,
          label,
          operator,
          threshold,
          unit,
        },
        index
      ) => (
        <React.Fragment key={index}>
          <Grid item xs={12}>
            <DisplayAlertDetailChips
              values={[
                aggregationTypeMap[aggregationType],
                label,
                metricOperatorTypeMap[operator],
                String(threshold),
                unit,
              ]}
              label="Metric Threshold"
              mergeChips
            />
          </Grid>

          {dimensionFilters.length > 0 && (
            <Grid item xs={12}>
              <DisplayAlertDetailChips
                values={dimensionFilters.map(
                  ({
                    label: dimensionLabel,
                    operator: dimensionOperator,
                    value,
                  }) => [
                    dimensionLabel,
                    dimensionOperatorTypeMap[dimensionOperator],
                    value,
                  ]
                )}
                label="Dimension Filter"
                mergeChips
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Divider />
          </Grid>
        </React.Fragment>
      )
    );
  }
);
