import React from 'react';

import { StackedBarChart } from 'src/components/StackedBarChart';

import { DynamicChartUpdate } from '../../Dashboard/UsageSection/DynamicChartUpdate';
import { ChartCard } from '../ChartCard/ChartCard';
import { buildChartData, buildSeriesColorIndices } from './chartData';

import type { ChartPayload } from '../../Dashboard/UsageSection/chartUtils';

export interface TokensUsedChartProps {
  chartCardTitle?: string;
  chartCardTooltipText?: string;
  chartData?: ChartPayload;
  chartDataBuilder?: () => ChartPayload;
  isLoading?: boolean;
  selectedSeriesId: string;
  showChartCard?: boolean;
  tooltipTitle?: string;
  xAxisInterval?: number;
}

export const TokensUsedChart = ({
  chartCardTitle = 'Tokens By Model',
  chartCardTooltipText = 'Total number of tokens consumed across all models during the selected time period, broken down by model.',
  chartData: externalChartData,
  chartDataBuilder,
  isLoading = false,
  selectedSeriesId,
  showChartCard = true,
  tooltipTitle = 'Tokens',
  xAxisInterval = 1,
}: TokensUsedChartProps) => {
  const builder = chartDataBuilder || buildChartData;
  const builtChartData = React.useMemo(() => builder(), [builder]);
  const allChartData = externalChartData || builtChartData;

  // Filter the data based on selectedSeriesId
  const filteredChartData = React.useMemo(() => {
    if (selectedSeriesId === 'all') {
      return allChartData;
    }
    return {
      ...allChartData,
      series: allChartData.series.filter((s) => s.id === selectedSeriesId),
    };
  }, [allChartData, selectedSeriesId]);

  const seriesColorIndices = React.useMemo(
    () => buildSeriesColorIndices(allChartData.series),
    [allChartData.series]
  );

  // If external chartData is provided, render StackedBarChart directly (consumer handles updates)
  // Otherwise, use DynamicChartUpdate to manage the interval
  const chart = externalChartData ? (
    <StackedBarChart
      barWidth={11}
      data={filteredChartData}
      height={160}
      isLoading={isLoading}
      seriesColorIndices={seriesColorIndices}
      stacked={true}
      tooltipTitle={tooltipTitle}
      xAxisInterval={xAxisInterval}
    />
  ) : (
    <DynamicChartUpdate
      barWidth={11}
      chartComponent={StackedBarChart}
      data={filteredChartData}
      height={160}
      isLoading={isLoading}
      selectedSeriesId={selectedSeriesId}
      seriesColorIndices={seriesColorIndices}
      stacked={true}
      tooltipTitle={tooltipTitle}
      updateIntervalMs={5000}
      xAxisInterval={xAxisInterval}
    />
  );

  if (!showChartCard) {
    return chart;
  }

  return (
    <ChartCard title={chartCardTitle} tooltipText={chartCardTooltipText}>
      {chart}
    </ChartCard>
  );
};
