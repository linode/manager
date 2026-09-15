import React from 'react';

import { Box, Chip, Paper, Stack, Typography } from '../../components';
import styles from './SpeedrunSectionCard.module.css';

export interface SpeedrunStep {
  description: string;
  title: string;
}

interface SpeedrunSectionCardProps {
  step: SpeedrunStep;
  stepNumber: number;
}

const stepColorClasses = [styles.stepOne, styles.stepTwo, styles.stepThree];

export const SpeedrunSectionCard = ({
  step,
  stepNumber,
}: SpeedrunSectionCardProps) => {
  const colorClass =
    stepColorClasses[(stepNumber - 1) % stepColorClasses.length];

  return (
    <Box className={`${styles.speedrunSectionCardWrapper} ${colorClass}`}>
      <Box className={styles.speedrunSectionCardTab} />
      <Paper className={styles.speedrunSectionCard}>
        <Stack className={styles.speedrunSectionCardContent}>
          <Stack
            className={styles.speedrunSectionCardContentHeader}
            direction="row"
          >
            <Chip className={styles.speedrunSectionCardStepNumber}>
              {stepNumber}
            </Chip>

            <Stack
              className={styles.speedrunSectionCardText}
              direction="column"
            >
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
    </Box>
  );
};
