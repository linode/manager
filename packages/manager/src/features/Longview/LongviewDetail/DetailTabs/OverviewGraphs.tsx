import { pathOr } from 'ramda';
import * as React from 'react';

import Paper from 'src/components/core/Paper';
import {
  makeStyles,
  Theme,
  WithTheme,
  withTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { readableBytes } from 'src/utilities/unitConversions';
import { AllData, getValues, WithStartAndEnd } from '../../request';
import { StatWithDummyPoint } from '../../request.types';
import { maybeAddDataPointInThePast } from '../../shared/formatters';
import TimeRangeSelect from '../../shared/TimeRangeSelect';
import { useClientLastUpdated } from '../../shared/useClientLastUpdated';
import { generateUsedMemory, statMax } from '../../shared/utilities';

const useStyles = makeStyles((theme: Theme) => ({
  paperSection: {
    padding: theme.spacing(3) + 1,
    marginBottom: theme.spacing(1) + 3
  }
}));

interface Props {
  clientAPIKey: string;
  timezone: string;
}
export type CombinedProps = Props & WithTheme;

export const OverviewGraphs: React.FC<CombinedProps> = props => {
  const { clientAPIKey, theme, timezone } = props;
  const classes = useStyles();
  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    start: 0,
    end: 0
  });
  const [data, setData] = React.useState<Partial<AllData>>({});
  const request = (start: number = time.start, end: number = time.end) => {
    // Don't start requesting until we have a time range.
    if (start === 0 || end === 0) {
      return;
    }
    getValues(clientAPIKey, {
      fields: ['cpu', 'memory', 'network', 'disk', 'load'],
      start,
      end
    }).then(response => {
      const _data = maybeAddDataPointInThePast(response, start, [
        ['Memory', 'real', 'used'],
        ['Memory', 'real', 'cache'],
        ['Memory', 'real', 'buffers'],
        ['Memory', 'swap', 'used'],
        ['Load']
      ]);
      setData(_data);
    });
  };

  useClientLastUpdated(clientAPIKey, request);

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ start, end });
    request(start, end);
  };

  const _convertData = React.useCallback(convertData, [
    data,
    time.start,
    time.end
  ]);

  const isToday = time.end - time.start < 60 * 60 * 25;

  /**
   * Memory calculations are funny, need to calculate them
   * here and determine what the graph's subtitle will be.
   */
  const buffers = pathOr<StatWithDummyPoint[]>(
    [],
    ['Memory', 'real', 'buffers'],
    data
  );
  const cache = pathOr<StatWithDummyPoint[]>(
    [],
    ['Memory', 'real', 'cache'],
    data
  );
  const used = getUsedMemory(
    pathOr([], ['Memory', 'real', 'used'], data),
    cache,
    buffers
  );
  const swap = pathOr<StatWithDummyPoint[]>(
    [],
    ['Memory', 'swap', 'used'],
    data
  );

  // Determine the unit based on the largest value
  const max = Math.max(statMax(buffers), statMax(cache), statMax(used));
  // LV returns stuff in KB so have to convert to bytes using base-2
  const unit = readableBytes(max * 1024).unit;

  return (
    <Grid container alignItems="flex-end" item xs={12} spacing={0}>
      <Grid
        container
        item
        direction="row"
        justify="space-between"
        alignItems="center"
        spacing={0}
        className="py0"
      >
        <Grid item>
          <Typography variant="h2">Resource Allocation History</Typography>
        </Grid>
        <Grid item>
          <TimeRangeSelect
            handleStatsChange={handleStatsChange}
            defaultValue={'Past 30 Minutes'}
          />
        </Grid>
      </Grid>
      <Grid item />
      <Grid item xs={12}>
        <Paper className={classes.paperSection}>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
            spacing={4}
          >
            <Grid item xs={6}>
              <LongviewLineGraph
                title="CPU"
                subtitle="%"
                showToday={isToday}
                timezone={timezone}
                data={[]}
              />
            </Grid>
            <Grid item xs={6}>
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
                    data: _convertData(swap, formatMemory)
                  },
                  {
                    label: 'Buffers',
                    borderColor: theme.graphs.pinkBorder,
                    backgroundColor: theme.graphs.pink,
                    data: _convertData(buffers, formatMemory)
                  },
                  {
                    label: 'Cache',
                    borderColor: theme.graphs.purpleBorder,
                    backgroundColor: theme.graphs.purple,
                    data: _convertData(cache, formatMemory)
                  },
                  {
                    label: 'Used',
                    borderColor: theme.graphs.darkPurpleBorder,
                    backgroundColor: theme.graphs.darkPurple,
                    data: _convertData(used)
                  }
                ]}
              />
            </Grid>
            <Grid item xs={6}>
              <LongviewLineGraph
                title="Network"
                subtitle="KB/s"
                showToday={isToday}
                timezone={timezone}
                data={[]}
              />
            </Grid>
            <Grid item xs={6}>
              <LongviewLineGraph
                title="Disk I/O"
                subtitle="ops/s"
                showToday={isToday}
                timezone={timezone}
                data={[]}
              />
            </Grid>
            <Grid item xs={6}>
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
                    data: _convertData(data.Load || [])
                  }
                ]}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
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
export const getUsedMemory = (
  used: StatWithDummyPoint[],
  cache: StatWithDummyPoint[],
  buffers: StatWithDummyPoint[]
) => {
  const result: StatWithDummyPoint[] = [];
  const totalLength = used.length;
  let i = 0;
  for (i; i < totalLength; i++) {
    const _used = pathOr({}, [i], used);
    const _cache = pathOr(0, [i, 'y'], cache);
    const _buffers = pathOr(0, [i, 'y'], buffers);
    if (_used.y === null) {
      // This is one of our padding data points
      result.push({ x: _used.x * 1000, y: null });
    } else {
      const calculatedUsed = generateUsedMemory(_used.y, _buffers, _cache);
      result.push({
        // Time will be converted to ms in convertData
        x: _used.x,
        // x1024 bc the API returns data in KB
        y: readableBytes(calculatedUsed * 1024).value
      });
    }
  }
  return result;
};

export const formatMemory = (value: number | null) => {
  if (value === null) {
    return value;
  }
  // x1024 bc the API returns data in KB
  return readableBytes(value * 1024).value;
};

export const convertData = (
  d: StatWithDummyPoint[],
  formatter?: (pt: number | null) => number | null
) =>
  d.map(
    thisPoint =>
      [
        thisPoint.x * 1000,
        formatter ? formatter(thisPoint.y) : thisPoint.y
      ] as [number, number | null]
  );

export default withTheme(OverviewGraphs);
