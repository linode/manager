import React from 'react';

import { Box, Paper, Typography } from '../../components';
import styles from './SpeedrunSection.module.css';
import { SpeedrunSectionCard } from './SpeedrunSectionCard';

import type { SpeedrunStep } from './SpeedrunSectionCard';

const steps: SpeedrunStep[] = [
  {
    description:
      'Create an inference API key and store as an environment variable.',
    title: 'Create API Key',
  },
  {
    description: 'and paste this into your applications code.',
    title: 'Grab OpenAPI snippet',
  },
  {
    description:
      'Execute your code and experience inference running on Akamai!.',
    title: 'Run inference',
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
