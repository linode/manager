import { Box, Select, Typography, useTheme } from '@linode/ui';
import React, { useContext, useEffect } from 'react';

import { useInferencePlatform } from '../InferencePlatformContext';
import { ModelPlaygroundModelContext } from './ModelPlaygroundContext';

export const ModelSelector = () => {
  const { onModelChange, selectedModel } = useContext(
    ModelPlaygroundModelContext
  );
  const { isModelsLoading, models } = useInferencePlatform();
  const theme = useTheme();

  // There is currently no information in the API response to determine if the
  // model is compatible with the model playground besides the presence of
  // "embedding" in the model ID, so we filter those out here.
  const options = models
    .filter((m) => !m.id.includes('embedding'))
    .map((m) => ({ label: m.id, value: m.id }));

  // Once models load, default-select the first one if the current selection
  // is no longer in the list.
  useEffect(() => {
    if (
      !isModelsLoading &&
      options.length > 0 &&
      !options.some((o) => o.value === selectedModel)
    ) {
      onModelChange(options[0].value);
    }
  }, [isModelsLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedOption = options.find((o) => o.value === selectedModel) ?? null;

  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor:
          theme.palette.mode === 'light' ? theme.bg.white : theme.bg.offWhite,
        display: 'flex',
        flexShrink: 0,
        gap: 2,
        px: 2,
        py: 2,
      }}
    >
      <Typography noWrap sx={{ flexShrink: 0 }}>
        Model
      </Typography>
      <Box sx={{ minWidth: 220 }}>
        <Select
          hideLabel
          label="Model"
          onChange={(_, value) => {
            onModelChange(value.value as string);
          }}
          options={options}
          placeholder="Loading models..."
          value={selectedOption}
        />
      </Box>
    </Box>
  );
};
