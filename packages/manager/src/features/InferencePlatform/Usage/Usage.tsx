import { useInferenceUsageQuery } from '@linode/queries';
import { Box, Stack } from '@linode/ui';
import React from 'react';

import { SingleMetricChart } from 'src/components/SingleMetricChart/SingleMetricChart';
import { ChartCard } from 'src/features/InferencePlatform/Usage/ChartCard/ChartCard';
import { DonutChartDynamic } from 'src/features/InferencePlatform/Usage/DonutChartDynamic/DonutChartDynamic';
import { FilterBar } from 'src/features/InferencePlatform/Usage/FilterBar/FilterBar';
import { MetricsByToolbar } from 'src/features/InferencePlatform/Usage/MetricsByToolbar/MetricsByToolbar';
import { TokensUsedChart } from 'src/features/InferencePlatform/Usage/TokensUsedChart/TokensUsedChart';
import {
  InputTokensChartDynamic,
  OutputTokensChartDynamic,
} from 'src/features/InferencePlatform/Usage/TokensUsedChart/TokensUsedChartVariants';
import {
  UsageDataProvider,
  useUsageData,
} from 'src/features/InferencePlatform/Usage/UsageDataContext';

import { transformAllUsageData } from './usageUtils';

import type { InferenceUsage } from '@linode/api-v4';

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  compactDisplay: 'short',
  maximumFractionDigits: 1,
  notation: 'compact',
});

const formatCompactMetric = (value: number) =>
  compactNumberFormatter.format(value).replace(/\.0([A-Z])$/, '$1');

const sumSeriesValues = (
  series: Array<{ id: string; values: Array<{ value: number }> }>,
  selectedSeriesId: string
) => {
  const filteredSeries =
    selectedSeriesId === 'all'
      ? series
      : series.filter((entry) => entry.id === selectedSeriesId);

  return filteredSeries.reduce((seriesTotal, entry) => {
    return (
      seriesTotal +
      entry.values.reduce((valueTotal, point) => valueTotal + point.value, 0)
    );
  }, 0);
};

interface UsageContentProps {
  /** All groups without aggregation - for dropdown options */
  allGroups: Array<{ id: string; label: string }>;
  isLoading: boolean;
  metricsByValue: 'api-key' | 'model';
  onMetricsByChange: (value: 'api-key' | 'model') => void;
  onSelectionChange: (selection: { label: string; value: string }) => void;
  selectedValue: { label: string; value: string };
}

const UsageContent = ({
  allGroups,
  isLoading,
  metricsByValue,
  onMetricsByChange,
  onSelectionChange,
  selectedValue,
}: UsageContentProps) => {
  const dynamicData = useUsageData();

  // Check if we have real data or just the "no-data" placeholder
  const hasRealData = React.useMemo(() => {
    return (
      dynamicData.total.series.length > 0 &&
      dynamicData.total.series[0]?.id !== 'no-data'
    );
  }, [dynamicData.total.series]);

  // Options come from allGroups (non-aggregated) for dropdowns
  // Sorted alphabetically by label (All is always first)
  const filterOptions = React.useMemo(
    () => [
      { label: 'All', value: 'all' },
      ...allGroups.map((g) => ({ label: g.label, value: g.id })),
    ],
    [allGroups]
  );

  // Determine active selection based on metricsBy
  const isModelView = metricsByValue === 'model';

  const totalMetrics = React.useMemo(
    () => ({
      inputTokens: sumSeriesValues(
        dynamicData.input.series,
        selectedValue.value
      ),
      outputTokens: sumSeriesValues(
        dynamicData.output.series,
        selectedValue.value
      ),
      totalRequests: sumSeriesValues(
        dynamicData.request.series,
        selectedValue.value
      ),
      totalTokens: sumSeriesValues(
        dynamicData.total.series,
        selectedValue.value
      ),
    }),
    [
      dynamicData.input.series,
      dynamicData.output.series,
      dynamicData.request.series,
      dynamicData.total.series,
      selectedValue.value,
    ]
  );

  // When a single item is selected, all metric cards adopt that item's color
  // index so they stay in sync with the other charts. Falls back to each card's
  // own index when viewing "All".
  const selectedColorIndex = React.useMemo(() => {
    if (selectedValue.value === 'all') {
      return undefined;
    }
    const index = dynamicData.total.series.findIndex(
      (series) => series.id === selectedValue.value
    );
    return index === -1 ? undefined : index;
  }, [dynamicData.total.series, selectedValue.value]);

  // Dynamic labels based on metricsBy
  const groupByLabel = isModelView ? 'Model' : 'API Key';
  const donutLegendColumnProportions = [57, 22, 21];

  return (
    <Stack gap={2} sx={{ p: 2 }}>
      <MetricsByToolbar
        metricsByValue={metricsByValue}
        onMetricsByChange={onMetricsByChange}
      />

      <FilterBar
        apiKeyOptions={filterOptions}
        metricsBy={metricsByValue}
        modelOptions={filterOptions}
        onApiKeyChange={onSelectionChange}
        onModelChange={onSelectionChange}
        selectedApiKey={selectedValue}
        selectedModel={selectedValue}
      />

      <Stack direction={{ lg: 'row', xs: 'column' }} gap={2}>
        <Box sx={{ flex: 1 }}>
          {/* Total Tokens Metric */}
          <SingleMetricChart
            colorIndex={selectedColorIndex ?? 0}
            isLoading={isLoading}
            label="Total Tokens"
            periodLabel="Last 24h"
            value={
              hasRealData
                ? formatCompactMetric(totalMetrics.totalTokens)
                : 'No Data'
            }
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          {/* Input Tokens Metric */}
          <SingleMetricChart
            colorIndex={selectedColorIndex ?? 1}
            isLoading={isLoading}
            label="Input Tokens"
            periodLabel="Last 24h"
            value={
              hasRealData
                ? formatCompactMetric(totalMetrics.inputTokens)
                : 'No Data'
            }
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          {/* Output Tokens Metric */}
          <SingleMetricChart
            colorIndex={selectedColorIndex ?? 2}
            isLoading={isLoading}
            label="Output Tokens"
            periodLabel="Last 24h"
            value={
              hasRealData
                ? formatCompactMetric(totalMetrics.outputTokens)
                : 'No Data'
            }
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          {/* Total Requests Metric */}
          <SingleMetricChart
            colorIndex={selectedColorIndex ?? 3}
            isLoading={isLoading}
            label="Total Requests"
            periodLabel="Last 24h"
            value={
              hasRealData
                ? formatCompactMetric(totalMetrics.totalRequests)
                : 'No Data'
            }
          />
        </Box>
      </Stack>

      <Stack direction={{ lg: 'row', xs: 'column' }} gap={2}>
        <Box sx={{ flex: 1 }}>
          {/* Tokens By Model/API Key over X time */}
          <TokensUsedChart
            chartCardTitle={`Tokens by ${groupByLabel}`}
            chartCardTooltipText={`Total Tokens consumed over time period, split-by ${groupByLabel}.`}
            chartData={dynamicData.total}
            isLoading={isLoading}
            selectedSeriesId={selectedValue.value}
            xAxisInterval={2}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <ChartCard
            title={`Total Tokens by ${groupByLabel}`}
            tooltipText={`Aggregate of Tokens over time period, split-by ${groupByLabel}.`}
          >
            {/* Tokens By Model/API Key totals over X time */}
            <DonutChartDynamic
              centerLabel={`${groupByLabel.toUpperCase()}\nTOKENS`}
              height={214}
              isLoading={isLoading}
              legendColumnProportions={donutLegendColumnProportions}
              legendValueFormatOptions={{
                value2: {
                  compactDisplay: 'short',
                  maximumFractionDigits: 1,
                  notation: 'compact',
                },
              }}
              periodLabel="Last 24h"
              selectedSeriesId={selectedValue.value}
            />
          </ChartCard>
        </Box>
      </Stack>

      <Stack direction={{ lg: 'row', xs: 'column' }} gap={2}>
        <Box sx={{ flex: 1 }}>
          <ChartCard
            title={`Input Tokens by ${groupByLabel}`}
            tooltipText={`Number of Input Tokens (user prompts) during time period, split-by ${groupByLabel}s .`}
          >
            {/* Input Tokens By Model/API Key over X time */}
            <InputTokensChartDynamic
              isLoading={isLoading}
              selectedSeriesId={selectedValue.value}
            />
          </ChartCard>
        </Box>
        <Box sx={{ flex: 1 }}>
          <ChartCard
            title={`Output Tokens by ${groupByLabel}`}
            tooltipText={`Number of Output Tokens (AI response) during time period, split-by ${groupByLabel}s .`}
          >
            {/* Output Tokens By Model/API Key over X time */}
            <OutputTokensChartDynamic
              isLoading={isLoading}
              selectedSeriesId={selectedValue.value}
            />
          </ChartCard>
        </Box>
      </Stack>

      <ChartCard
        title={`Requests by ${groupByLabel}`}
        tooltipText={`Total number of API requests made during time period, split-by ${groupByLabel}s.`}
      >
        {/* Requests By Model/API Key over X time */}
        <TokensUsedChart
          chartData={dynamicData.request}
          isLoading={isLoading}
          selectedSeriesId={selectedValue.value}
          showChartCard={false}
          tooltipTitle="Requests"
          xAxisInterval={2}
        />
      </ChartCard>
    </Stack>
  );
};

export const Usage = () => {
  // Track grouping mode - affects API call and chart labels
  const [metricsByValue, setMetricsByValue] = React.useState<
    'api-key' | 'model'
  >('model');

  // Track selected filter value (model or API key)
  const [selectedValue, setSelectedValue] = React.useState<{
    label: string;
    value: string;
  }>({ label: 'All', value: 'all' });

  // Reset selection when switching between model and api-key views
  const handleMetricsByChange = React.useCallback(
    (value: 'api-key' | 'model') => {
      setMetricsByValue(value);
      setSelectedValue({ label: 'All', value: 'all' });
    },
    []
  );

  // Fetch usage data from API with parameters
  // Client-side filtering is used when a specific model/key is selected
  const {
    data: apiUsageData,
    error: usageError,
    isFetching,
    isError: isUsageError,
  } = useInferenceUsageQuery({
    granularity: 'hour',
    group_by: metricsByValue === 'api-key' ? 'api-key' : 'model',
    include_time_series: true,
  });

  const isUsageNotFound = React.useMemo(() => {
    if (!isUsageError || !usageError) {
      return false;
    }

    return usageError.some((errorItem) => {
      const status = (errorItem as { status?: number }).status;
      const normalizedReason = errorItem.reason.trim().toLowerCase();

      return status === 404 || normalizedReason === 'not found';
    });
  }, [isUsageError, usageError]);

  // Transform API data to chart format in a single pass (more efficient than
  // calling transform 4 times - only iterates time_series once, constructs
  // Date objects once, and sorts once per group)
  // - When "All" is selected: applies Top 5 + "Other" aggregation
  // - When a specific item is selected: shows only that item's data
  const {
    allGroups,
    input: initialInputData,
    output: initialOutputData,
    request: initialRequestData,
    total: initialTotalData,
  } = React.useMemo(() => {
    const usageDataForCharts = (isUsageNotFound ? undefined : apiUsageData) as
      | InferenceUsage
      | undefined;

    return transformAllUsageData(
      usageDataForCharts,
      metricsByValue,
      selectedValue.value
    );
  }, [apiUsageData, isUsageNotFound, metricsByValue, selectedValue.value]);

  return (
    <UsageDataProvider
      initialInputData={initialInputData}
      initialOutputData={initialOutputData}
      initialRequestData={initialRequestData}
      initialTotalData={initialTotalData}
    >
      <UsageContent
        allGroups={allGroups}
        isLoading={isFetching}
        metricsByValue={metricsByValue}
        onMetricsByChange={handleMetricsByChange}
        onSelectionChange={setSelectedValue}
        selectedValue={selectedValue}
      />
    </UsageDataProvider>
  );
};
