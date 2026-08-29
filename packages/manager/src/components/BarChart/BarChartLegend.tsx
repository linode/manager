import React from 'react';

import MetricsDisplay from 'src/components/LineGraph/MetricsDisplay';
import { StyledBottomLegend } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSummary/TablesPanel';

import type { BaseChartProps } from '../chartTypes';

interface BarChartLegendProps {
  activeSeries: string[];
  handleLegendClick: (dataKey: string) => void;
  legendHeight?: string;
  legendRows: NonNullable<BaseChartProps['legendRows']>;
}

export const BarChartLegend = ({
  activeSeries,
  handleLegendClick,
  legendHeight,
  legendRows,
}: BarChartLegendProps) => {
  const legendRowsWithClickHandler = legendRows.map((legendRow) => ({
    ...legendRow,
    handleLegendClick: () => handleLegendClick(legendRow.legendTitle),
  }));

  return (
    <StyledBottomLegend legendHeight={legendHeight}>
      <MetricsDisplay
        hiddenRows={activeSeries}
        rows={legendRowsWithClickHandler}
      />
    </StyledBottomLegend>
  );
};
