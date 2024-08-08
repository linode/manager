import { Box, Typography } from '@mui/material';
import * as React from 'react';

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

  const message = error // Error state is separate, don't want to put text on top of it
    ? undefined
    : loading // Loading takes precedence over empty data
    ? 'Loading data...'
    : isDataEmpty(props.data)
    ? 'No data to display'
    : undefined;

  return (
    <Box p={2}>
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
          }}
          ariaLabel={ariaLabel!}
          isLegendsFullSize={true}
          legendRows={props.legendRows}
        />
      )}
      {message && (
        <Box
          sx={{
            left: '40%',
            position: 'absolute',
            top: '30%',
          }}
        >
          <Typography variant="body2">{message}</Typography>
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
