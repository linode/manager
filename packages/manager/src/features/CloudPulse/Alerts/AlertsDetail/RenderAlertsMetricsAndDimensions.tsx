import { Divider, Grid } from '@mui/material';
import React from 'react';

import NullComponent from 'src/components/NullComponent';

import { aggregationTypes, operators } from '../constants';
import { DisplayAlertChips } from './AlertDetailChips';

import type { MetricCriteria } from '@linode/api-v4';

interface AlertMetricAndDimensionsProp {
  /*
   * The rule criteria associated with the alert for which the dimension filters are needed to be displayed
   */
  ruleCriteria: {
    rules: MetricCriteria[];
  };
}

export const RenderAlertMetricsAndDimensions = React.memo(
  (props: AlertMetricAndDimensionsProp) => {
    const { ruleCriteria } = props;

    if (!Boolean(ruleCriteria.rules?.length)) {
      return <NullComponent />;
    }

    return ruleCriteria.rules.map(
      (
        {
          aggregation_type: aggregationType,
          dimension_filters: dimensionFilters,
          metric: label,
          operator,
          threshold,
        },
        idx
      ) => (
        <React.Fragment key={idx}>
          <Grid item xs={12}>
            <DisplayAlertChips
              values={[
                aggregationType
                  ? aggregationTypes[aggregationType]
                  : aggregationType,
                label,
                operator ? operators[operator] : operator,
                String(threshold),
              ]}
              isJoin
              label="Metric Threshold"
            />
          </Grid>
          <Grid item xs={12}>
            <DisplayAlertChips
              values={dimensionFilters.map(({ label, operator, value }) => [
                label,
                operator,
                value,
              ])}
              isJoin
              label="Dimension Filter"
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
        </React.Fragment>
      )
    );
  }
);
