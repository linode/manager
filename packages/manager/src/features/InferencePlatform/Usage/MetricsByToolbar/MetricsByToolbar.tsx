import { DateField } from '@akamai/cds-components/react/DateField';
import { Box, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

import { ToggleOptionSelector } from 'src/components/ToggleOptionSelector';

const METRICS_BY_OPTIONS = [
  { label: 'Model', value: 'model' },
  { label: 'API Key', value: 'api-key' },
];

export interface MetricsByToolbarProps {
  metricsByValue: 'api-key' | 'model';
  onMetricsByChange: (value: 'api-key' | 'model') => void;
}

export const MetricsByToolbar = ({
  metricsByValue,
  onMetricsByChange,
}: MetricsByToolbarProps) => {
  const handleSelect = (value: string) => {
    onMetricsByChange(value as 'api-key' | 'model');
  };

  return (
    <Paper
      sx={{
        backgroundColor: 'transparent',
        maxWidth: '100%',
        minWidth: 0,
        overflow: 'hidden',
        px: 0,
        py: 1.5,
        width: '100%',
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        sx={{ minWidth: 0, width: '100%' }}
      >
        <Stack
          alignItems="center"
          direction="row"
          gap={1.5}
          sx={{ minWidth: 0 }}
        >
          <Typography
            sx={(theme) => ({ flexShrink: 0, font: theme.font.bold })}
            variant="body2"
          >
            Metrics by
          </Typography>

          <ToggleOptionSelector
            onSelect={handleSelect}
            options={METRICS_BY_OPTIONS}
            selectedValue={metricsByValue}
          />
        </Stack>

        <Box sx={{ flexShrink: 0, maxWidth: '100%', minWidth: 0, width: 220 }}>
          <DateField
            aria-label="Time range"
            disabled
            displayTimeZone={false}
            format="MMM d, yyyy"
            mode="day"
            placeholder="Last 24 hours"
            style={{
              display: 'block',
              flex: '0 1 auto',
              maxWidth: '100%',
              minWidth: '0',
              width: '100%',
            }}
          />
        </Box>
      </Stack>
    </Paper>
  );
};
