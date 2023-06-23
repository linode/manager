import * as React from 'react';
import { withTheme, WithTheme } from '@mui/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { sumCPU } from 'src/features/Longview/shared/utilities';
import {
  convertData,
  pathMaybeAddDataInThePast,
} from '../../../shared/formatters';
import { GraphProps } from './types';
import { useGraphs } from './useGraphs';

export type CombinedProps = GraphProps & WithTheme;

export const CPUGraph: React.FC<CombinedProps> = (props) => {
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
      ['wait'],
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
      unit="%"
      ariaLabel="CPU Usage Graph"
      nativeLegend
      error={error}
      loading={loading}
      showToday={isToday}
      timezone={timezone}
      data={[
        {
          backgroundColor: theme.graphs.cpu.system,
          borderColor: 'transparent',
          data: _convertData(cpuData.system, start, end),
          label: 'System',
        },
        {
          backgroundColor: theme.graphs.cpu.user,
          borderColor: 'transparent',
          data: _convertData(cpuData.user, start, end),
          label: 'User',
        },
        {
          backgroundColor: theme.graphs.cpu.wait,
          borderColor: 'transparent',
          data: _convertData(cpuData.wait, start, end),
          label: 'Wait',
        },
      ]}
    />
  );
};

export default withTheme(CPUGraph);
