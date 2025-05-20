import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';
import { sumCPU } from 'src/features/Longview/shared/utilities';

import {
  convertData,
  pathMaybeAddDataInThePast,
} from '../../../shared/formatters';
import { useGraphs } from './useGraphs';

import type { GraphProps } from './types';

export const CPUGraph = (props: GraphProps) => {
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
    ['cpu'],
    clientAPIKey,
    start,
    end
  );

  const cpuData = React.useMemo(() => {
    const summedCPUData = sumCPU(data.CPU);
    return pathMaybeAddDataInThePast(summedCPUData, start, [
      'system',
      'user',
      'wait',
    ]);
  }, [data.CPU]);

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey, lastUpdated, lastUpdatedError]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  return (
    <LongviewLineGraph
      ariaLabel="CPU Usage Graph"
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
      error={error}
      loading={loading}
      nativeLegend
      showToday={isToday}
      subtitle="%"
      timezone={timezone}
      title="CPU"
      unit="%"
    />
  );
};
