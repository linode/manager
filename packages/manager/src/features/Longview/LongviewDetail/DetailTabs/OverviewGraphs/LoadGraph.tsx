import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';

import { convertData } from '../../../shared/formatters';
import { useGraphs } from './useGraphs';

import type { GraphProps } from './types';

export const LoadGraph = (props: GraphProps) => {
  const {
    clientAPIKey,
    end,
    isToday,
    lastUpdated,
    lastUpdatedError,
    start,
    timezone,
  } = props;

  const theme = useTheme();

  const { data, error, loading, request } = useGraphs(
    ['load'],
    clientAPIKey,
    start,
    end
  );

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey, lastUpdated, lastUpdatedError]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  return (
    <LongviewLineGraph
      ariaLabel="Load Graph"
      data={[
        {
          backgroundColor: theme.graphs.load,
          borderColor: 'transparent',
          data: _convertData(data.Load || [], start, end),
          label: 'Load',
        },
      ]}
      error={error}
      loading={loading}
      nativeLegend
      showToday={isToday}
      subtitle="Target < 1.00"
      timezone={timezone}
      title="Load"
    />
  );
};
