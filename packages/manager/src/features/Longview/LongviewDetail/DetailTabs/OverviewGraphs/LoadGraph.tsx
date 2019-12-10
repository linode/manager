import * as React from 'react';
import { withTheme, WithTheme } from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { AllData, getValues } from '../../../request';
import { convertData } from '../../../shared/formatters';

interface Props {
  clientAPIKey: string;
  isToday: boolean;
  timezone: string;
  start: number;
  end: number;
}

export type CombinedProps = Props & WithTheme;

export const LoadGraph: React.FC<CombinedProps> = props => {
  const { clientAPIKey, end, isToday, start, theme, timezone } = props;

  const [data, setData] = React.useState<Partial<AllData>>({});
  const request = () => {
    return getValues(clientAPIKey, {
      fields: ['load'],
      start,
      end
    }).then(response => {
      setData(response);
    });
  };

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  return (
    <LongviewLineGraph
      title="Load"
      subtitle="Target < 1.00"
      showToday={isToday}
      timezone={timezone}
      data={[
        {
          label: 'Load',
          borderColor: theme.graphs.blueBorder,
          backgroundColor: theme.graphs.blue,
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
