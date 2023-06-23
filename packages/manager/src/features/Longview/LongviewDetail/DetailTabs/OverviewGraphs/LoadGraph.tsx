import * as React from 'react';
import { withTheme, WithTheme } from '@mui/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
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
      title="Load"
      subtitle="Target < 1.00"
      ariaLabel="Load Graph"
      error={error}
      loading={loading}
      showToday={isToday}
      timezone={timezone}
      nativeLegend
      data={[
        {
          backgroundColor: theme.graphs.load,
          borderColor: 'transparent',
          data: _convertData(data.Load || [], start, end),
          label: 'Load',
        },
      ]}
    />
  );
};

export default withTheme(LoadGraph);
