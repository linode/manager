import * as React from 'react';
import { withTheme, WithTheme } from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { sumCPU } from 'src/features/Longview/shared/utilities';
import { AllData, getValues } from '../../../request';
import {
  convertData,
  pathMaybeAddDataInThePast
} from '../../../shared/formatters';

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
      fields: ['cpu'],
      start,
      end
    }).then(response => {
      setData(response);
    });
  };

  const cpuData = React.useMemo(() => {
    const summedCPUData = sumCPU(data.CPU);
    return pathMaybeAddDataInThePast(summedCPUData, start, [
      ['system'],
      ['user'],
      ['wait']
    ]);
  }, [data.CPU]);

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  return (
    <LongviewLineGraph
      title="CPU"
      subtitle="%"
      showToday={isToday}
      timezone={timezone}
      data={[
        {
          label: 'System',
          borderColor: theme.graphs.deepBlueBorder,
          backgroundColor: theme.graphs.deepBlue,
          data: _convertData(cpuData.system, start, formatCPU)
        },
        {
          label: 'User',
          borderColor: theme.graphs.skyBlueBorder,
          backgroundColor: theme.graphs.skyBlue,
          data: _convertData(cpuData.user, start, formatCPU)
        },
        {
          label: 'Wait',
          borderColor: theme.graphs.lightBlueBorder,
          backgroundColor: theme.graphs.lightBlue,
          data: _convertData(cpuData.wait, start, formatCPU)
        }
      ]}
    />
  );
};

export default withTheme(LoadGraph);

const formatCPU = (value: number | null) => {
  if (value === null) {
    return value;
  }

  // Round to 2 decimal places.
  return Math.round(value * 100) / 100;
};
