import { Box, Typography, useTheme } from '@mui/material';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LineGraph } from 'src/components/LineGraph/LineGraph';

import { isDataEmpty } from '../../Utils/CloudPulseWidgetUtils';

import type { LegendRow } from '../CloudPulseWidget';
import type { LineGraphProps } from 'src/components/LineGraph/LineGraph';

export interface CloudPulseLineGraph extends LineGraphProps {
  ariaLabel?: string;
  error?: string;
  gridSize: number;
  legendRows?: LegendRow[];
  loading?: boolean;
  subtitle?: string;
  title: string;
}

export const CloudPulseLineGraph = React.memo((props: CloudPulseLineGraph) => {
  const { ariaLabel, data, error, legendRows, loading, ...rest } = props;

  const theme = useTheme();

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
        <LineGraph
          {...rest}
          sxTableStyles={{
            '& .MuiTable-root': {
              border: 0,
            },
            backgroundColor: theme.bg.offWhite,
            maxHeight: `calc(${theme.spacing(14)} + 3px)`,
            minHeight: `calc(${theme.spacing(10)})`,
            overflow: 'auto',
            paddingLeft: theme.spacing(1),
          }}
          ariaLabel={ariaLabel}
          data={data}
          isLegendsFullSize={true}
          legendRows={legendRows}
        />
      )}
      {isDataEmpty(data) && (
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
