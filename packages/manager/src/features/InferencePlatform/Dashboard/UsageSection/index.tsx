import { useInferenceUsageQuery } from '@linode/queries';
import { Box, Paper, Select, Stack, Typography } from '@linode/ui';
import React from 'react';

import { StackedBarChart } from 'src/components/StackedBarChart';
import { getExtraPresets, isMSWEnabled } from 'src/dev-tools/utils';
import { transformApiDataToChartPayload } from 'src/features/InferencePlatform/Usage/usageUtils';

import { filterChartPayloadBySeries } from './chartUtils';
import { DynamicChartUpdate } from './DynamicChartUpdate';

export const UsageSection = () => {
  // Check if Usage mock is enabled (evaluated at render time)
  const useMockAnimation =
    isMSWEnabled && getExtraPresets().includes('inferencePlatform:usage');

  // Fetch usage data from API (MSW intercepts when mock is enabled)
  // Explicit params to avoid relying on server defaults
  const { data: apiUsageData } = useInferenceUsageQuery({
    granularity: 'hour',
    group_by: 'model',
    include_time_series: true,
  });

  // Transform data: use API data when available, fall back to minimal "no data" placeholder
  const transformedData = React.useMemo(() => {
    return transformApiDataToChartPayload(apiUsageData);
  }, [apiUsageData]);

  // Map each series ID to its position in the array (for consistent colors)
  const seriesColorIndices = React.useMemo(() => {
    const indices: Record<string, number> = {};
    transformedData.series.forEach((series, index) => {
      indices[series.id] = index;
    });
    return indices;
  }, [transformedData.series]);

  const seriesOptions = React.useMemo(() => {
    return [
      { label: 'All series', value: 'all' },
      ...transformedData.series
        .filter((series) => series.id !== 'no-data')
        .map((series) => ({
          label: series.label,
          value: series.id,
        })),
    ];
  }, [transformedData]);

  const [selectedSeriesId, setSelectedSeriesId] = React.useState(
    seriesOptions[0]
  );

  return (
    <Paper
      sx={{ border: 'none', borderRadius: 0, p: 0, mb: 2 }}
      variant="outlined"
    >
      <Paper
        sx={{
          border: 'none',
          borderRadius: 0,
          mt: 0,
          padding: '20px 26px 24px 6px',
        }}
      >
        <Stack
          alignContent="flex-start"
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
          sx={{
            "& [data-testid='inputLabelWrapper']": {
              display: 'none',
            },
            mb: 1,
            padding: '0px 0px 16px 14px',
          }}
        >
          <Typography variant="h3">Usage - Tokens</Typography>

          <Box
            sx={{
              minWidth: 220,
              mb: 0,
            }}
          >
            <Select
              label=""
              onChange={(_, option) => {
                if (option) {
                  setSelectedSeriesId(
                    option as { label: string; value: string }
                  );
                }
              }}
              options={seriesOptions}
              sx={{ margins: 0, padding: 0 }}
              value={selectedSeriesId}
            />
          </Box>
        </Stack>

        {useMockAnimation ? (
          <DynamicChartUpdate
            barWidth={13}
            chartComponent={StackedBarChart}
            data={transformedData}
            selectedSeriesId={selectedSeriesId.value}
            seriesColorIndices={seriesColorIndices}
            stacked={true}
            updateIntervalMs={5000}
          />
        ) : (
          <StackedBarChart
            barWidth={13}
            data={filterChartPayloadBySeries(
              transformedData,
              selectedSeriesId.value
            )}
            seriesColorIndices={seriesColorIndices}
            stacked={true}
          />
        )}
      </Paper>
    </Paper>
  );
};
