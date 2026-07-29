import { Box, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';

const BENCHMARK_FEATURE_ENABLED = false;

export const BenchmarkBannerSection = () => {
  if (!BENCHMARK_FEATURE_ENABLED) {
    return null;
  }

  return (
    <Paper
      sx={(theme) => ({
        background: 'linear-gradient(120deg, #0e172f 0%, #1b2f63 100%)',
        borderRadius: 1,
        color: theme.palette.common.white,
        overflow: 'hidden',
        p: 3,
        position: 'relative',
      })}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderRadius: '50%',
          height: 220,
          position: 'absolute',
          right: -80,
          top: -20,
          width: 220,
        }}
      />

      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Stack gap={1}>
          <Typography color="inherit" variant="h2">
            Compare model performance with benchmark snapshots
          </Typography>
          <Typography color="inherit" sx={{ opacity: 0.88 }} variant="body1">
            Explore quality, latency, and cost metrics across top model
            families.
          </Typography>
          <Link to="/inference-platform/usage">View benchmark</Link>
        </Stack>
        <Box
          sx={{
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: 1,
            display: { sm: 'block', xs: 'none' },
            height: 90,
            minWidth: 160,
          }}
        />
      </Stack>
    </Paper>
  );
};
