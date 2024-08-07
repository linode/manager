import { Box, Typography } from '@mui/material';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LineGraph } from 'src/components/LineGraph/LineGraph';

import type { LegendRow } from '../CloudPulseWidget';
import type {
  DataSet,
  LineGraphProps,
} from 'src/components/LineGraph/LineGraph';

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
  const { ariaLabel, error, loading, ...rest } = props;

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
          ariaLabel={ariaLabel!}
          isLegendsFullSize={true}
          legendRows={props.legendRows}
        />
      )}
      {isDataEmpty(props.data) && (
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

export const isDataEmpty = (data: DataSet[]) => {
  return data.every(
    (thisSeries) =>
      thisSeries.data.length === 0 ||
      // If we've padded the data, every y value will be null
      thisSeries.data.every((thisPoint) => thisPoint[1] === null)
  );
};
