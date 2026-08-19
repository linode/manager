import React from 'react';

import { Box, Paper, Typography } from '../../components';
import styles from './SpeedrunSection.module.css';
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
    <Paper className={styles.speedrunSection}>
      <Typography className={styles.inferenceSpeedrun}>
        Inference Speedrun
      </Typography>

      <Box className={styles.speedrunSteps}>
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
