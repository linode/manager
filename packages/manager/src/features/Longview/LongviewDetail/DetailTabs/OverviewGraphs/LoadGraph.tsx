import { WithTheme, withTheme } from '@mui/styles';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';

import { convertData } from '../../../shared/formatters';
import { GraphProps } from './types';
import { useGraphs } from './useGraphs';

export type CombinedProps = GraphProps & WithTheme;

export const LoadGraph: React.FC<CombinedProps> = (props) => {
  const {
    clientAPIKey,
    end,
    isToday,
    lastUpdated,
    lastUpdatedError,
    start,
    theme,
    timezone,
  } = props;

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
      data={[
        {
          backgroundColor: theme.graphs.load,
          borderColor: 'transparent',
          data: _convertData(data.Load || [], start, end),
          label: 'Load',
        },
      ]}
      ariaLabel="Load Graph"
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

export default withTheme(LoadGraph);
