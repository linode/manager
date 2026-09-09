import React from 'react';

import { SingleKpiChart } from 'src/components/SingleKpiChart';
import { useFlags } from 'src/hooks/useFlags';
import { useCloudPulseMetricsQuery } from 'src/queries/cloudpulse/metrics';

import { getCloudPulseMetricRequest } from '../Utils/CloudPulseWidgetUtils';
import { humanizeLargeData } from '../Utils/utils';
import {
  calculateAggregatedValue,
  getWidgetPeriodLabel,
  isCloudPulseMetricsResponse,
} from './CloudPulseSingleCellUtils';

import type { CloudPulseWidgetProperties } from './CloudPulseWidget';

export const CloudPulseSingleCellWidget = React.memo(
  (props: CloudPulseWidgetProperties) => {
    const flags = useFlags();
    const {
      duration,
      entityIds,
      resources,
      widget,
      linodeRegion,
      region,
      serviceType,
      authToken,
      isJweTokenFetching,
      timeStamp,
    } = props;

    const {
      data: metricsList,
      error,
      isLoading,
    } = useCloudPulseMetricsQuery(
      serviceType,
      {
        ...getCloudPulseMetricRequest({
          duration,
          entityIds,
          resources,
          widget,
          linodeRegion,
          region,
          serviceType,
        }),
      },
      {
        authToken,
        isFlags: Boolean(flags && !isJweTokenFetching),
        label: widget.label,
        timeStamp,
        url: flags.aclpReadEndpoint!,
      }
    );
    const singleMetricChartData = React.useMemo(() => {
      if (!isCloudPulseMetricsResponse(metricsList)) {
        return [];
      }

      // TypeScript automatically knows metricsList is CloudPulseMetricsResponse here
      return (
        metricsList.data.result[0]?.values.map(([timestamp, val]) => ({
          timestamp: Number(timestamp),
          value: val === null ? null : Number(val),
        })) ?? []
      );
    }, [metricsList]);

    const aggregatedValue = React.useMemo(() => {
      if (!singleMetricChartData || singleMetricChartData.length === 0) {
        return 0;
      }

      return calculateAggregatedValue(
        singleMetricChartData,
        widget.summary_level_aggregate_function
      );
    }, [singleMetricChartData, widget.summary_level_aggregate_function]);

    const periodLabel = React.useMemo(
      () => getWidgetPeriodLabel(duration, singleMetricChartData),
      [duration, singleMetricChartData]
    );

    return (
      <SingleKpiChart
        chartData={singleMetricChartData ?? []}
        error={error && error.length > 0 ? error[0].reason : undefined}
        isLoading={isLoading || isJweTokenFetching}
        label={widget.label + '(' + widget.unit + ')'}
        periodLabel={periodLabel}
        value={aggregatedValue ? humanizeLargeData(aggregatedValue) : 0}
      />
    );
  }
);
