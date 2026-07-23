import { Select } from '@akamai/cds-components/react/Select';
import { Box, Divider, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

export interface FilterBarOption {
  label: string;
  value: string;
}

export interface FilterBarProps {
  apiKeyOptions: FilterBarOption[];
  metricsBy: 'api-key' | 'model';
  modelOptions: FilterBarOption[];
  onApiKeyChange: (option: FilterBarOption) => void;
  onModelChange: (option: FilterBarOption) => void;
  selectedApiKey: FilterBarOption;
  selectedModel: FilterBarOption;
}

export const FilterBar = ({
  apiKeyOptions,
  metricsBy,
  modelOptions,
  onApiKeyChange,
  onModelChange,
  selectedApiKey,
  selectedModel,
}: FilterBarProps) => {
  const isModelView = metricsBy === 'model';

  return (
    <Paper sx={{ px: 2, py: 1.5, borderWidth: 0 }} variant="outlined">
      <Stack direction="row" gap={3}>
        {/* Model dropdown */}
        <Stack alignItems="center" direction="row" gap={1.5}>
          <Typography
            color={isModelView ? 'text.primary' : 'text.disabled'}
            sx={{ flexShrink: 0 }}
            variant="body2"
          >
            Model
          </Typography>

          <Box sx={{ minWidth: 180 }}>
            <Select<FilterBarOption>
              aria-label="Model"
              disabled={!isModelView}
              items={modelOptions}
              onChange={(event) => {
                const option =
                  event.detail as unknown as FilterBarOption | null;
                if (option) {
                  onModelChange(option);
                }
              }}
              selected={selectedModel}
              valueFn={(item) => (item as FilterBarOption).label}
            />
          </Box>
        </Stack>

        <Divider flexItem orientation="vertical" />

        {/* API Key dropdown */}
        <Stack alignItems="center" direction="row" gap={1.5}>
          <Typography
            color={!isModelView ? 'text.primary' : 'text.disabled'}
            sx={{ flexShrink: 0 }}
            variant="body2"
          >
            API key
          </Typography>
          <Box sx={{ minWidth: 180 }}>
            <Select<FilterBarOption>
              aria-label="API Key"
              disabled={isModelView}
              items={apiKeyOptions}
              onChange={(event) => {
                const option =
                  event.detail as unknown as FilterBarOption | null;
                if (option) {
                  onApiKeyChange(option);
                }
              }}
              selected={selectedApiKey}
              valueFn={(item) => (item as FilterBarOption).label}
            />
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};
