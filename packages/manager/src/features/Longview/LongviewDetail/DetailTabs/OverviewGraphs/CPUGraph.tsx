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
      tooltipUnit="%"
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
          data: _convertData(cpuData.system, start, end)
        },
        {
          label: 'User',
          borderColor: 'transparent',
          backgroundColor: theme.graphs.cpu.user,
          data: _convertData(cpuData.user, start, end)
        },
        {
          label: 'Wait',
          borderColor: 'transparent',
          backgroundColor: theme.graphs.cpu.wait,
          data: _convertData(cpuData.wait, start, end)
        }
      ]}
    />
  );
};

export default withTheme(CPUGraph);
