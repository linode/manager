import { useTheme, Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

import { Grid } from 'src/components/Grid';
import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';
import {
  convertBytesToTarget,
  readableBytes,
} from 'src/utilities/unitConversions';

import { LongviewProcesses } from '../../request.types';
import { convertData, formatMemory } from '../../shared/formatters';
import {
  statMax,
  sumRelatedProcessesAcrossAllUsers,
} from '../../shared/utilities';

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    padding: `${theme.spacing(3.25)} ${theme.spacing(3.25)} ${theme.spacing(
      5.5
    )}`,
  },
  smallGraph: {
    marginTop: `calc(${theme.spacing(6)} + 3px)`,
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(3.25),
    },
  },
}));

interface Props {
  data: LongviewProcesses;
  end: number;
  error?: string;
  isToday: boolean;
  loading: boolean;
  start: number;
  timezone: string;
}

export const ProcessGraphs = React.memo((props: Props) => {
  const { classes } = useStyles();
  const { data, end, error, isToday, loading, start, timezone } = props;
  const theme = useTheme();

  const _convertData = React.useCallback(convertData, [data, start, end]);
  const _data = React.useMemo(() => sumRelatedProcessesAcrossAllUsers(data), [
    data,
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
  const maxProcessCount = Math.max(statMax(processCount), 10);

  const memoryUnit = readableBytes(statMax(_data.mem ?? []) * 1024).unit;

  const graphProps = {
    error,
    loading,
    nativeLegend: true,
    showToday: isToday,
    timezone,
  };

  return (
    <>
      <Grid item xs={12}>
        <Grid container direction="row">
          <Grid className={classes.smallGraph} item sm={6} xs={12}>
            <LongviewLineGraph
              data={[
                {
                  backgroundColor: theme.graphs.cpu.percent,
                  borderColor: 'transparent',
                  data: _convertData(cpu, start, end),
                  label: 'CPU',
                },
              ]}
              ariaLabel="CPU Usage Graph"
              subtitle={'%'}
              title="CPU"
              unit="%"
              {...graphProps}
            />
          </Grid>
          <Grid className={classes.smallGraph} item sm={6} xs={12}>
            <LongviewLineGraph
              data={[
                {
                  backgroundColor: theme.graphs.ram,
                  borderColor: 'transparent',
                  data: _convertData(memory, start, end, formatMemory),
                  label: 'RAM',
                },
              ]}
              formatData={(value: number) =>
                convertBytesToTarget(memoryUnit, value)
              }
              ariaLabel="RAM Usage Graph"
              formatTooltip={(value: number) => readableBytes(value).formatted}
              subtitle={memoryUnit}
              title="RAM"
              {...graphProps}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="row">
          <Grid className={classes.smallGraph} item sm={6} xs={12}>
            <LongviewLineGraph
              data={[
                {
                  backgroundColor: theme.graphs.diskIO.read,
                  borderColor: 'transparent',
                  data: _convertData(diskRead, start, end),
                  label: 'Read',
                },
                {
                  backgroundColor: theme.graphs.diskIO.write,
                  borderColor: 'transparent',
                  data: _convertData(diskWrite, start, end),
                  label: 'Write',
                },
              ]}
              formatData={(value: number) =>
                convertBytesToTarget(diskUnit, value)
              }
              ariaLabel="Disk I/O Graph"
              formatTooltip={(value: number) => readableBytes(value).formatted}
              subtitle={`${diskUnit}/s`}
              title="Disk I/O"
              unit={`/s`}
              {...graphProps}
            />
          </Grid>
          <Grid className={classes.smallGraph} item sm={6} xs={12}>
            <LongviewLineGraph
              data={[
                {
                  backgroundColor: theme.graphs.processCount,
                  borderColor: 'transparent',
                  data: _convertData(processCount, start, end),
                  label: 'Count',
                },
              ]}
              ariaLabel="Process Count Graph"
              suggestedMax={maxProcessCount}
              title="Process Count"
              {...graphProps}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
});
