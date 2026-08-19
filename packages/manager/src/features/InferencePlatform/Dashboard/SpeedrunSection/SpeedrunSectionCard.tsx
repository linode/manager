import React from 'react';

import { Box, Paper, Stack, Typography } from '../../components';
import styles from './SpeedrunSectionCard.module.css';

export interface SpeedrunStep {
  description: string;
  title: string;
}

interface SpeedrunSectionCardProps {
  step: SpeedrunStep;
  stepNumber: number;
}

export const SpeedrunSectionCard = ({
  step,
  stepNumber,
}: SpeedrunSectionCardProps) => {
  return (
    <Paper className={styles.speedrunSectionCard}>
      <Stack className={styles.speedrunSectionCardContent}>
        <Stack
          className={styles.speedrunSectionCardContentHeader}
          direction="row"
        >
          <Box className={styles.speedrunSectionCardStepNumber}>
            {stepNumber}
          </Box>

          <Stack className={styles.speedrunSectionCardText} direction="column">
            <Typography className={styles.speedrunSectionCardTitle}>
              {step.title}
            </Typography>

            <Typography className={styles.speedrunSectionCardDescription}>
              {step.description}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};
