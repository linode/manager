import { convertBytesToTarget, readableBytes } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';

import { convertData, formatMemory } from '../../../shared/formatters';
import { generateUsedMemory, getMaxUnit } from '../../../shared/utilities';
import { useGraphs } from './useGraphs';

import type { Stat } from '../../../request.types';
import type { GraphProps } from './types';

export const MemoryGraph = (props: GraphProps) => {
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
    ['memory'],
    clientAPIKey,
    start,
    end
  );

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey, lastUpdated, lastUpdatedError]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  const buffers = data.Memory?.real.buffers ?? [];
  const cache = data.Memory?.real.cache ?? [];
  const used = getUsedMemory(data.Memory?.real.used ?? [], cache, buffers);
  const swap = data.Memory?.swap.used ?? [];

  // Determine the unit based on the largest value
  const unit = React.useMemo(
    () => getMaxUnit([buffers, cache, used, swap]),
    [buffers, cache, used, swap]
  );

  return (
    <LongviewLineGraph
      data={[
        {
          backgroundColor: theme.graphs.memory.swap,
          borderColor: 'transparent',
          data: _convertData(swap, start, end, formatMemory),
          label: 'Swap',
        },
        {
          backgroundColor: theme.graphs.memory.buffers,
          borderColor: 'transparent',
          data: _convertData(buffers, start, end, formatMemory),
          label: 'Buffers',
        },
        {
          backgroundColor: theme.graphs.memory.cache,
          borderColor: 'transparent',
          data: _convertData(cache, start, end, formatMemory),
          label: 'Cache',
        },
        {
          backgroundColor: theme.graphs.memory.used,
          borderColor: 'transparent',
          data: _convertData(used, start, end, formatMemory),
          label: 'Used',
        },
      ]}
      ariaLabel="Memory Usage Graph"
      error={error}
      formatData={(value: number) => convertBytesToTarget(unit, value)}
      formatTooltip={(value: number) => readableBytes(value).formatted}
      loading={loading}
      nativeLegend
      showToday={isToday}
      subtitle={unit}
      timezone={timezone}
      title="Memory"
    />
  );
};

/**
 * This uses the generateUsedMemory utility,
 * but unlike in the graphs, here we're dealing
 * with three arrays of stats that have to be
 * mapped through.
 *
 * @param used
 * @param cache
 * @param buffers
 */
export const getUsedMemory = (used: Stat[], cache: Stat[], buffers: Stat[]) => {
  const result: Stat[] = [];
  const totalLength = used.length;
  let i = 0;
  for (i; i < totalLength; i++) {
    const _used = used[i] ?? {};
    const _cache = cache[i].y ?? 0;
    const _buffers = buffers[i].y ?? 0;
    const calculatedUsed = generateUsedMemory(_used.y, _buffers, _cache);
    result.push({
      // Time will be converted to ms in convertData
      x: _used.x,
      y: calculatedUsed,
    });
  }
  return result;
};
