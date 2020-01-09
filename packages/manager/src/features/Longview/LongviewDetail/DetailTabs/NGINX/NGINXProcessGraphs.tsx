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

export const NGINXProcessGraphs: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { data, error, loading, isToday, timezone, start, end, theme } = props;

  const totalDataForAllUsers = React.useMemo(
    () => sumRelatedProcessesAcrossAllUsers(data),
    [data]
  );

  const _convertData = React.useCallback(convertData, [data, start, end]);

  /**
   * These field names say kbytes, but Classic reports them
   * as bytes and they're read from the read_bytes and write_bytes
   * from cat /proc/$PID/io, which are bytes. No reason (I hope)
   * to multiply by 1024 to get the byte value here.
   */
  const diskRead = totalDataForAllUsers.ioreadkbytes ?? [];
  const diskWrite = totalDataForAllUsers.iowritekbytes ?? [];
  const maxDisk = Math.max(statMax(diskRead), statMax(diskWrite));
  const diskUnit = readableBytes(maxDisk).unit;

  const cpu = totalDataForAllUsers.cpu ?? [];
  const memory = totalDataForAllUsers.mem ?? [];
  const processCount = totalDataForAllUsers.count ?? [];

  const memoryUnit = readableBytes(statMax(memory) * 1024).unit;

  const graphProps = {
    timezone,
    showToday: isToday,
    loading,
    error
  };

  return (
    <>
      <Grid item xs={12}>
        <Grid container direction="row">
          <Grid item xs={12} sm={6} className={classes.smallGraph}>
            <LongviewLineGraph
              title="CPU"
              subtitle={'%'}
              data={[
                {
                  label: 'CPU',
                  borderColor: 'transparent',
                  backgroundColor: theme.graphs.cpu,
                  data: _convertData(cpu, start, end, formatData)
                }
              ]}
              {...graphProps}
            />
          </Grid>
          <Grid item xs={12} sm={6} className={classes.smallGraph}>
            <LongviewLineGraph
              title="RAM"
              subtitle={memoryUnit}
              data={[
                {
                  label: 'RAM',
                  borderColor: 'transparent',
                  backgroundColor: theme.graphs.ram,
                  data: _convertData(memory, start, end, formatMemory)
                }
              ]}
              {...graphProps}
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
              data={[
                {
                  label: 'Read',
                  borderColor: 'transparent',
                  backgroundColor: theme.graphs.diskIO.read,
                  data: _convertData(diskRead, start, end, formatData)
                },
                {
                  label: 'Write',
                  borderColor: 'transparent',
                  backgroundColor: theme.graphs.diskIO.write,
                  data: _convertData(diskWrite, start, end, formatData)
                }
              ]}
              {...graphProps}
            />
          </Grid>
          <Grid item xs={12} sm={6} className={classes.smallGraph}>
            <LongviewLineGraph
              title="Process Count"
              data={[
                {
                  label: 'Count',
                  borderColor: 'transparent',
                  backgroundColor: theme.graphs.processCount,
                  data: _convertData(processCount, start, end, formatData)
                }
              ]}
              {...graphProps}
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
)(NGINXProcessGraphs);
export default enhanced;
