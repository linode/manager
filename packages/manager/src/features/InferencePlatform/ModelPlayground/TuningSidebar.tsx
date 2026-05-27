import { Box, Typography } from '@linode/ui';
import React from 'react';

export const TuningSidebar = () => {
  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.bg.offWhite,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflowY: 'auto',
        p: 2,
        width: 280,
      })}
    >
      <Typography variant="h3">Tuning</Typography>
    </Box>
  );
};
