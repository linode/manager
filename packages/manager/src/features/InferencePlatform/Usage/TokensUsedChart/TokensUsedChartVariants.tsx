import React from 'react';

import { TokensUsedChart } from 'src/features/InferencePlatform/Usage/TokensUsedChart/TokensUsedChart';
import { useUsageData } from 'src/features/InferencePlatform/Usage/UsageDataContext';

type TokensChartVariantProps = {
  isLoading?: boolean;
  selectedSeriesId: string;
  xAxisInterval?: number;
};

export const InputTokensChartDynamic = ({
  isLoading = false,
  selectedSeriesId,
  xAxisInterval = 4,
}: TokensChartVariantProps) => {
  const dynamicData = useUsageData();

  return (
    <TokensUsedChart
      chartData={dynamicData.input}
      isLoading={isLoading}
      selectedSeriesId={selectedSeriesId}
      showChartCard={false}
      xAxisInterval={xAxisInterval}
    />
  );
};

export const OutputTokensChartDynamic = ({
  isLoading = false,
  selectedSeriesId,
  xAxisInterval = 4,
}: TokensChartVariantProps) => {
  const dynamicData = useUsageData();

  return (
    <TokensUsedChart
      chartData={dynamicData.output}
      isLoading={isLoading}
      selectedSeriesId={selectedSeriesId}
      showChartCard={false}
      xAxisInterval={xAxisInterval}
    />
  );
};
