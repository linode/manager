import * as React from 'react';
import { withTheme, WithTheme } from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { AllData, getValues } from '../../../request';
import { convertData } from '../../../shared/formatters';
import { GraphProps } from './types';

export type CombinedProps = GraphProps & WithTheme;

export const LoadGraph: React.FC<CombinedProps> = props => {
  const {
    clientAPIKey,
    lastUpdated,
    lastUpdatedError,
    end,
    isToday,
    start,
    theme,
    timezone
  } = props;

  const [data, setData] = React.useState<Partial<AllData>>({});
  const [error, setError] = React.useState<string | undefined>();
  const request = () => {
    if (!start || !end) {
      return;
    }
    return getValues(clientAPIKey, {
      fields: ['load'],
      start,
      end
    })
      .then(response => {
        setError(undefined);
        setData(response);
      })
      .catch(_ => setError('Unable to retrieve load data.'));
  };

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey, lastUpdated, lastUpdatedError]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  return (
    <LongviewLineGraph
      title="Load"
      subtitle="Target < 1.00"
      error={error}
      showToday={isToday}
      timezone={timezone}
      data={[
        {
          label: 'Load',
          borderColor: theme.graphs.lightGoldBorder,
          backgroundColor: theme.graphs.lightGold,
          data: _convertData(data.Load || [], start, formatLoad)
        }
      ]}
    />
  );
};

const formatLoad = (value: number | null) => {
  if (value === null) {
    return value;
  }

  // Round to 2 decimal places.
  return Math.round(value * 100) / 100;
};

export default withTheme(LoadGraph);
