import { pathOr } from 'ramda';
import * as React from 'react';
import { withTheme, WithTheme } from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { readableBytes } from 'src/utilities/unitConversions';
import { AllData, getValues } from '../../../request';
import { Stat } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import { generateUsedMemory, statMax } from '../../../shared/utilities';

interface Props {
  clientAPIKey: string;
  isToday: boolean;
  timezone: string;
  start: number;
  end: number;
}

export type CombinedProps = Props & WithTheme;

export const MemoryGraph: React.FC<CombinedProps> = props => {
  const { clientAPIKey, end, isToday, start, theme, timezone } = props;

  const [data, setData] = React.useState<Partial<AllData>>({});
  const request = () => {
    return getValues(clientAPIKey, {
      fields: ['memory'],
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

  const buffers = pathOr<Stat[]>([], ['Memory', 'real', 'buffers'], data);
  const cache = pathOr<Stat[]>([], ['Memory', 'real', 'cache'], data);
  const used = getUsedMemory(
    pathOr([], ['Memory', 'real', 'used'], data),
    cache,
    buffers
  );
  const swap = pathOr<Stat[]>([], ['Memory', 'swap', 'used'], data);

  // Determine the unit based on the largest value
  const max = Math.max(
    statMax(buffers),
    statMax(cache),
    statMax(used),
    statMax(swap)
  );
  // LV returns stuff in KB so have to convert to bytes using base-2
  const unit = readableBytes(max * 1024).unit;

  return (
    <LongviewLineGraph
      title="Memory"
      subtitle={unit}
      showToday={isToday}
      timezone={timezone}
      data={[
        {
          label: 'Swap',
          borderColor: theme.graphs.redBorder,
          backgroundColor: theme.graphs.red,
          data: _convertData(swap, start, formatMemory)
        },
        {
          label: 'Buffers',
          borderColor: theme.graphs.darkPurpleBorder,
          backgroundColor: theme.graphs.darkPurple,
          data: _convertData(buffers, start, formatMemory)
        },
        {
          label: 'Cache',
          borderColor: theme.graphs.purpleBorder,
          backgroundColor: theme.graphs.purple,
          data: _convertData(cache, start, formatMemory)
        },
        {
          label: 'Used',
          borderColor: theme.graphs.lightPurpleBorder,
          backgroundColor: theme.graphs.lightPurple,
          data: _convertData(used, start, formatMemory)
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

/**
 * Scale of memory data will vary, so we use this function
 * to run the data through readableBytes to determine
 * whether to show MB, KB, or GB.
 * @param value
 */
export const formatMemory = (value: number | null) => {
  if (value === null) {
    return value;
  }
  // x1024 bc the API returns data in KB
  return readableBytes(value * 1024).value;
};

export default withTheme(MemoryGraph);
