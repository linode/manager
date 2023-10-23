import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Paper } from 'src/components/Paper';

export const LoadBalancerRegions = () => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        flexGrow: 1,
        marginTop: theme.spacing(3),
        width: '100%',
      }}
      data-qa-label-header
    >
      TODO: Implement Regions Field.
    </Paper>
  );
};
