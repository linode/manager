import { Box, Typography } from '@mui/material';
import * as React from 'react';

import { AreaChart } from 'src/components/AreaChart/AreaChart';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';

import type { AreaChartProps } from 'src/components/AreaChart/AreaChart';

export interface CloudPulseLineGraph extends AreaChartProps {
  error?: string;
  loading?: boolean;
}

export const CloudPulseLineGraph = React.memo((props: CloudPulseLineGraph) => {
  const { error, loading, ...rest } = props;

  if (loading) {
    return <CircleProgress sx={{ minHeight: '380px' }} />;
  }

  if (error) {
    return <ErrorState errorText={error} />;
  }

  const noDataMessage = 'No data to display';

  return (
    <Box p={2} position="relative">
      {error ? (
        <Box sx={{ height: '100%' }}>
          <ErrorState errorText={error} />
        </Box>
      ) : (
        <AreaChart {...rest} />
      )}
      {rest.data.length === 0 && (
        <Box
          sx={{
            bottom: '60%',
            left: '50%',
            position: 'absolute',
          }}
        >
          <Typography variant="body2">{noDataMessage}</Typography>
        </Box>
      )}
    </Box>
  );
});
