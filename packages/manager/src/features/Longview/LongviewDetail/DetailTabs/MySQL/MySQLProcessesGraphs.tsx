import * as React from 'react';
import { compose } from 'recompose';
import {
  makeStyles,
  Theme,
  WithTheme,
  withTheme
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { readableBytes } from 'src/utilities/unitConversions';
import { LongviewProcesses } from '../../../request.types';
import { convertData, formatMemory } from '../../../shared/formatters';
import {
  statMax,
  sumRelatedProcessesAcrossAllUsers
} from '../../../shared/utilities';

const useStyles = makeStyles((theme: Theme) => ({
  smallGraph: {
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(3) + 2
    },
    marginTop: theme.spacing(6) + 3
  }
}));

interface Props {
  data: LongviewProcesses;
  loading: boolean;
  isToday: boolean;
  timezone: string;
  error?: string;
  start: number;
  end: number;
}

type CombinedProps = Props & WithTheme;

export const MySQLProcessGraphs: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { data, error, loading, isToday, timezone, start, end, theme } = props;

  const _convertData = React.useCallback(convertData, [data, start, end]);

  const _data = React.useMemo(() => sumRelatedProcessesAcrossAllUsers(data), [
    data
  ]);

  /**
   * These field names say kbytes, but Classic reports them
   * as bytes and they're read from the read_bytes and write_bytes
   * from cat /proc/$PID/io, which are bytes. No reason (I hope)
   * to multiply by 1024 to get the byte value here.
   */
  const diskRead = _data.ioreadkbytes ?? [];
  const diskWrite = _data.iowritekbytes ?? [];
  const maxDisk = Math.max(statMax(diskRead), statMax(diskWrite));
  const diskUnit = readableBytes(maxDisk).unit;

  const cpu = _data.cpu ?? [];
  const memory = _data.mem ?? [];
  const processCount = _data.count ?? [];

  const memoryUnit = readableBytes(statMax(_data.mem ?? []) * 1024).unit;

  return (
    <>
      <Grid item xs={12}>
        <Grid container direction="row">
          <Grid item xs={12} sm={6} className={classes.smallGraph}>
            <LongviewLineGraph
              title="CPU"
              subtitle={'%'}
              error={error}
              loading={loading}
              showToday={isToday}
              timezone={timezone}
              data={[
                {
                  label: 'CPU',
                  borderColor: '#63d997',
                  backgroundColor: '#63d997',
                  data: _convertData(cpu, start, end, formatData)
                }
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={6} className={classes.smallGraph}>
            <LongviewLineGraph
              title="RAM"
              subtitle={memoryUnit}
              error={error}
              loading={loading}
              showToday={isToday}
              timezone={timezone}
              data={[
                {
                  label: 'RAM',
                  borderColor: theme.graphs.lightPurpleBorder,
                  backgroundColor: theme.graphs.lightPurple,
                  data: _convertData(memory, start, end, formatMemory)
                }
              ]}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="row">
          <Grid item xs={12} sm={6} className={classes.smallGraph}>
            <LongviewLineGraph
              title="Disk I/O"
              subtitle={`${diskUnit}/s`}
              error={error}
              loading={loading}
              showToday={isToday}
              timezone={timezone}
              data={[
                {
                  label: 'Read',
                  borderColor: theme.graphs.lightYellow,
                  backgroundColor: theme.graphs.lightYellow,
                  data: _convertData(diskRead, start, end, formatData)
                },
                {
                  label: 'Write',
                  borderColor: theme.graphs.lightOrange,
                  backgroundColor: theme.graphs.lightOrange,
                  data: _convertData(diskWrite, start, end, formatData)
                }
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={6} className={classes.smallGraph}>
            <LongviewLineGraph
              title="Process Count"
              error={error}
              loading={loading}
              showToday={isToday}
              timezone={timezone}
              data={[
                {
                  label: 'Count',
                  borderColor: '#7156f5',
                  backgroundColor: '#7156f5',
                  data: _convertData(processCount, start, end, formatData)
                }
              ]}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const formatData = (value: number | null) => {
  if (value === null) {
    return value;
  }

  // Round to 2 decimal places.
  return Math.round(value * 100) / 100;
};

const enhanced = compose<CombinedProps, Props>(
  withTheme,
  React.memo
)(MySQLProcessGraphs);
export default enhanced;
