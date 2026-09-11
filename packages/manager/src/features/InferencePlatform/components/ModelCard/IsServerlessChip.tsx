import { Box, Stack } from '@linode/ui';
import React from 'react';

import Lightning from 'src/assets/icons/ai/lightning.svg';

import styles from './IsServerlessChip.module.css';

export const IsServerlessChip = () => {
  return (
    <Stack alignItems="center" direction="row" gap={0.3}>
      <Box
        className={styles.icon}
        component={Lightning}
        sx={(theme) => ({ color: theme.palette.warning.dark })}
      />
      <span className={styles.label}>Serverless</span>
    </Stack>
  );
};
