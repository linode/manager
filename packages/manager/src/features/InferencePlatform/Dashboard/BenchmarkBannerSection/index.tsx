import React from 'react';

import { Link } from 'src/components/Link';

import { Box, Paper, Stack, Typography } from '../../components';
import styles from './BenchmarkBannerSection.module.css';

const BENCHMARK_FEATURE_ENABLED = false;

export const BenchmarkBannerSection = () => {
  if (!BENCHMARK_FEATURE_ENABLED) {
    return null;
  }

  return (
    <Paper className={styles.paper}>
      <Box className={styles.decorativeBox} />
      <Stack
        alignItems="center"
        className={styles.contentStack}
        direction="row"
        justifyContent="space-between"
      >
        <Stack spacing="8px">
          <Typography className={styles.heading} component="h2">
            Compare model performance with benchmark snapshots
          </Typography>
          <Typography className={styles.description}>
            Explore quality, latency, and cost metrics across top model
            families.
          </Typography>
          <Link to="/inference-platform/usage">View benchmark</Link>
        </Stack>
        <Box className={styles.smallBox} />
      </Stack>
    </Paper>
  );
};
