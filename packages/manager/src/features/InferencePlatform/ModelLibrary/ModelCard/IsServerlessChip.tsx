import { Box, Stack, Typography } from '@linode/ui';
import React from 'react';

import Lightning from 'src/assets/icons/ai/lightning.svg';

export const IsServerlessChip = () => {
  return (
    <Stack alignItems="center" direction="row" gap={0.3}>
      <Box
        component={Lightning}
        sx={(theme) => ({
          color: theme.palette.warning.dark,
          height: 14,
          width: 14,
        })}
      />
      <Typography
        sx={(theme) => ({
          color: theme.palette.text.primary,
          font: theme.font.semibold,
          fontSize: 12,
        })}
      >
        Serverless
      </Typography>
    </Stack>
  );
};
