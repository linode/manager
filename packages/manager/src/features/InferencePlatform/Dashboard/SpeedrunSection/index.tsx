import { Box, Paper, Typography } from '@linode/ui';
import React from 'react';

import { SpeedrunSectionCard } from './SpeedrunSectionCard';

import type { SpeedrunStep } from './SpeedrunSectionCard';

const steps: SpeedrunStep[] = [
  {
    description: 'and save it to your application folder.',
    title: 'Create API Key',
  },
  {
    description: 'and paste this into your applications code.',
    title: 'Copy the OpenAPI Snippet',
  },
  {
    description: 'Enter a prompt and observe the results.',
    title: 'Test your Inference',
  },
];

export const SpeedrunSection = () => {
  return (
    <Paper
      sx={{
        border: 'none',
        padding: 0,
        pb: 2,
        backgroundColor: 'transparent',
      }}
      variant="outlined"
    >
      <Typography sx={{ mb: 2 }} variant="h3">
        Inference Speedrun
      </Typography>

      <Box
        sx={(theme) => ({
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          [theme.breakpoints.down('md')]: {
            gridTemplateColumns: '1fr',
          },
        })}
      >
        {steps.map((step, index) => (
          <SpeedrunSectionCard
            key={step.title}
            step={step}
            stepNumber={index + 1}
          />
        ))}
      </Box>
    </Paper>
  );
};
