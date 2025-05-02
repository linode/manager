import { CircleProgress, ErrorState, Typography } from '@linode/ui';
import { roundTo } from '@linode/utilities';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';

import { AreaChart } from 'src/components/AreaChart/AreaChart';

import type { AreaChartProps } from 'src/components/AreaChart/AreaChart';

export interface CloudPulseLineGraph extends AreaChartProps {
  error?: string;
  loading?: boolean;
}

export const CloudPulseLineGraph = React.memo((props: CloudPulseLineGraph) => {
  const { error, loading, ...rest } = props;

  const theme = useTheme();

  // to reduce the x-axis tick count for small screen
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return <CircleProgress sx={{ minHeight: '380px' }} />;
  }

  if (error) {
    return <ErrorState errorText={error} />;
  }

  const noDataMessage = 'No data to display';
  return (
    <Box
      sx={{
        p: 2,
        position: 'relative',
      }}
    >
      {error ? (
        <Box sx={{ height: '100%' }}>
          <ErrorState errorText={error} />
        </Box>
      ) : (
        <AreaChart
          {...rest}
          margin={{
            bottom: 0,
            left: -15,
            right: 30,
            top: 2,
          }}
          xAxisTickCount={
            isSmallScreen ? undefined : Math.min(rest.data.length, 7)
          }
          yAxisProps={{
            tickFormat: (value: number) => `${roundTo(value, 3)}`,
          }}
          fillOpacity={0.5}
          legendHeight="165px"
        />
      )}
      {rest.data.length === 0 && (
        <Box
          sx={{
            bottom: '50%',
            left: '45%',
            position: 'absolute',
          }}
        >
          <Typography variant="body2">{noDataMessage}</Typography>
        </Box>
      )}
    </Box>
  );
});
