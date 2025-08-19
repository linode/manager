import { useAllLinodesQuery } from '@linode/queries';
import { Divider } from '@linode/ui';
import { GridLegacy } from '@mui/material';
import React, { useMemo } from 'react';

import NullComponent from 'src/components/NullComponent';
import { transformDimensionValue } from 'src/features/CloudPulse/Alerts/Utils/utils';

import {
  aggregationTypeMap,
  dimensionOperatorTypeMap,
  metricOperatorTypeMap,
} from '../constants';
import { DisplayAlertDetailChips } from './DisplayAlertDetailChips';

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

export const RenderAlertMetricsAndDimensions = React.memo(
  (props: AlertMetricAndDimensionsProp) => {
    const { ruleCriteria, serviceType } = props;

    const needsLinodes = useMemo(
      () =>
        ruleCriteria.rules?.some((rule) =>
          rule.dimension_filters?.some(
            (df) =>
              df.dimension_label === 'linode_id' &&
              ['equal', 'in', 'not_equal'].includes(df.operator ?? '')
          )
        ) ?? false,
      [ruleCriteria]
    );

    // 2. Always call the query, but only run when needed
    const { data: linodes } = useAllLinodesQuery({}, {}, needsLinodes);

    const linodeMap = useMemo(
      () =>
        linodes?.reduce<Record<string, string>>((acc, linode) => {
          acc[String(linode.id)] = linode.label;
          return acc;
        }, {}) ?? {},
      [linodes]
    );

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

                    //  Special case: linode_id → resolve to labels
                    if (
                      dimensionFilterKey === 'linode_id' &&
                      ['equal', 'in', 'not_equal'].includes(
                        dimensionOperator
                      ) &&
                      value
                    ) {
                      resolvedValue = value
                        .split(',')
                        .map((id) => linodeMap[id] ?? id)
                        .join(', ');
                    }

                    // Pass the resolved value into transformDimensionValue
                    const displayValue = transformDimensionValue(
                      serviceType,
                      dimensionFilterKey,
                      resolvedValue
                    );
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
