import { pathOr } from 'ramda';
import * as React from 'react';
import { withTheme, WithTheme } from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { StorageSymbol } from 'src/utilities/unitConversions';
import { Stat } from '../../../request.types';
import { convertData, formatMemory } from '../../../shared/formatters';
import { generateUsedMemory, getMaxUnit } from '../../../shared/utilities';
import { GraphProps } from './types';
import { useGraphs } from './useGraphs';

export type CombinedProps = GraphProps & WithTheme;

export const MemoryGraph: React.FC<CombinedProps> = props => {
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
    ['memory'],
    clientAPIKey,
    start,
    end
  );

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey, lastUpdated, lastUpdatedError]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  const buffers = pathOr<Stat[]>([], ['Memory', 'real', 'buffers'], data);
  const cache = pathOr<Stat[]>([], ['Memory', 'real', 'cache'], data);
  const used = getUsedMemory(
    pathOr([], ['Memory', 'real', 'used'], data),
    cache,
    buffers
  );
  const swap = pathOr<Stat[]>([], ['Memory', 'swap', 'used'], data);

  // Determine the unit based on the largest value
  const unit = React.useMemo(() => getMaxUnit([buffers, cache, used, swap]), [
    buffers,
    cache,
    used,
    swap
  ]);

  return (
    <LongviewLineGraph
      title="Memory"
      subtitle={unit}
      maxUnit={unit as StorageSymbol}
      error={error}
      loading={loading}
      showToday={isToday}
      timezone={timezone}
      nativeLegend
      data={[
        {
          label: 'Swap',
          borderColor: 'transparent',
          backgroundColor: theme.graphs.memory.swap,
          data: _convertData(swap, start, end, formatMemory)
        },
        {
          label: 'Buffers',
          borderColor: 'transparent',
          backgroundColor: theme.graphs.memory.buffers,
          data: _convertData(buffers, start, end, formatMemory)
        },
        {
          label: 'Cache',
          borderColor: 'transparent',
          backgroundColor: theme.graphs.memory.cache,
          data: _convertData(cache, start, end, formatMemory)
        },
        {
          label: 'Used',
          borderColor: 'transparent',
          backgroundColor: theme.graphs.memory.used,
          data: _convertData(used, start, end, formatMemory)
        }
      ]}
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
    const _used = pathOr({}, [i], used);
    const _cache = pathOr(0, [i, 'y'], cache);
    const _buffers = pathOr(0, [i, 'y'], buffers);
    const calculatedUsed = generateUsedMemory(_used.y, _buffers, _cache);
    result.push({
      // Time will be converted to ms in convertData
      x: _used.x,
      y: calculatedUsed
    });
  }
  return result;
};

export default withTheme(MemoryGraph);
