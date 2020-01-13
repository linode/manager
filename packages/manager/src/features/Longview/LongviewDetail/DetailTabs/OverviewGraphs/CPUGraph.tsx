import * as React from 'react';
import { withTheme, WithTheme } from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { sumCPU } from 'src/features/Longview/shared/utilities';
import {
  convertData,
  pathMaybeAddDataInThePast
} from '../../../shared/formatters';
import { GraphProps } from './types';
import { useGraphs } from './useGraphs';

export type CombinedProps = GraphProps & WithTheme;

export const CPUGraph: React.FC<CombinedProps> = props => {
  const {
    clientAPIKey,
    end,
    isToday,
    lastUpdated,
    lastUpdatedError,
    start,
    theme,
    timezone
  } = props;

  const { data, loading, error, request } = useGraphs(
    ['cpu'],
    clientAPIKey,
    start,
    end
  );

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
  }, [start, end, clientAPIKey, lastUpdated, lastUpdatedError]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  return (
    <LongviewLineGraph
      title="CPU"
      subtitle="%"
      nativeLegend
      error={error}
      loading={loading}
      showToday={isToday}
      timezone={timezone}
      data={[
        {
          label: 'System',
          borderColor: 'transparent',
          backgroundColor: theme.graphs.cpu.system,
          data: _convertData(cpuData.system, start, end, formatCPU)
        },
        {
          label: 'User',
          borderColor: 'transparent',
          backgroundColor: theme.graphs.cpu.user,
          data: _convertData(cpuData.user, start, end, formatCPU)
        },
        {
          label: 'Wait',
          borderColor: 'transparent',
          backgroundColor: theme.graphs.cpu.wait,
          data: _convertData(cpuData.wait, start, end, formatCPU)
        }
      ]}
    />
  );
};

export default withTheme(CPUGraph);

export const formatCPU = (value: number | null) => {
  if (value === null) {
    return value;
  }

  // Round to 2 decimal places.
  return Math.round(value * 100) / 100;
};
