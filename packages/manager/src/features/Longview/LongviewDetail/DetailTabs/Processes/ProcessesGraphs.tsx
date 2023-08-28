import { useTheme, Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';
import { Typography } from 'src/components/Typography';
import { Paper } from 'src/components/Paper';
import {
  LongviewProcesses,
  WithStartAndEnd,
} from 'src/features/Longview/request.types';
import {
  convertData,
  formatMemory,
} from 'src/features/Longview/shared/formatters';
import { statMax } from 'src/features/Longview/shared/utilities';
import {
  convertBytesToTarget,
  readableBytes,
} from 'src/utilities/unitConversions';

import { Process } from './types';

const useStyles = makeStyles()((theme: Theme) => ({
  graphWrap: {
    marginTop: theme.spacing(3),
  },
  root: {
    marginTop: theme.spacing(1.25),
    padding: theme.spacing(3),
  },
  title: {
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
    },
  },
}));

interface Props {
  clientAPIKey: string;
  error?: string;
  isToday: boolean;
  lastUpdated?: number;
  processesData: LongviewProcesses;
  processesLoading: boolean;
  selectedProcess: Process | null;
  time: WithStartAndEnd;
  timezone: string;
}

export const ProcessesGraphs = (props: Props) => {
  const { classes } = useStyles();

  const {
    error,
    isToday,
    processesData,
    processesLoading,
    selectedProcess,
    time,
    timezone,
  } = props;

  const theme = useTheme();

  const { end, start } = time;

  const name = selectedProcess?.name ?? '';
  const user = selectedProcess?.user ?? '';
  const process = processesData.Processes?.[name]?.[user] ?? {};

  const cpu = process.cpu ?? [];
  const count = process.count ?? [];
  const memory = process.mem ?? [];
  const iowritekbytes = process.iowritekbytes ?? [];
  const ioreadkbytes = process.ioreadkbytes ?? [];

  const memMax = React.useMemo(() => statMax(memory), [memory]);
  // Multiplied by 1024 because the API returns memory in KB.
  const memUnit = readableBytes(memMax * 1024).unit;

  const ioMax = React.useMemo(
    () => Math.max(statMax(iowritekbytes), statMax(ioreadkbytes)),
    [iowritekbytes, ioreadkbytes]
  );
  const ioUnit = readableBytes(ioMax).unit;

  const formatDisk = (value: null | number) => {
    if (!value) {
      return value;
    }
    return readableBytes(value, { unit: ioUnit }).value;
  };

  const _convertData = React.useCallback(convertData, [
    processesData,
    start,
    end,
  ]);

  const commonGraphProps = {
    error,
    loading: processesLoading,
    showToday: isToday,
    timezone,
  };

  return (
    <>
      <Typography className={classes.title} variant="h2">
        Process History{name && `: ${name}`}
      </Typography>
      <Paper className={classes.root}>
        <LongviewLineGraph
          data={[
            {
              backgroundColor: theme.graphs.cpu.system,
              borderColor: 'transparent',
              data: _convertData(cpu, start, end),
              label: 'CPU',
            },
          ]}
          ariaLabel="CPU Usage Graph"
          subtitle="%"
          title="CPU"
          unit="%"
          {...commonGraphProps}
        />
        <div className={classes.graphWrap}>
          <LongviewLineGraph
            data={[
              {
                backgroundColor: theme.graphs.memory.used,
                borderColor: 'transparent',
                data: _convertData(memory, start, end, formatMemory),
                label: 'RAM',
              },
            ]}
            ariaLabel="RAM Usage Graph"
            formatData={(value: number) => convertBytesToTarget(memUnit, value)}
            formatTooltip={(value: number) => readableBytes(value).formatted}
            subtitle={memUnit}
            title="RAM"
            {...commonGraphProps}
          />
        </div>
        <div className={classes.graphWrap}>
          <LongviewLineGraph
            data={[
              {
                backgroundColor: theme.graphs.processCount,
                borderColor: 'transparent',
                data: _convertData(count, start, end, formatCount),
                label: 'Count',
              },
            ]}
            ariaLabel="Process Count Graph"
            suggestedMax={10}
            title="Count"
            {...commonGraphProps}
          />
        </div>
        <div className={classes.graphWrap}>
          <LongviewLineGraph
            data={[
              {
                backgroundColor: theme.graphs.diskIO.write,
                borderColor: 'transparent',
                data: _convertData(iowritekbytes, start, end, formatDisk),
                label: 'Write',
              },
              {
                backgroundColor: theme.graphs.diskIO.read,
                borderColor: 'transparent',
                data: _convertData(ioreadkbytes, start, end, formatDisk),
                label: 'Read',
              },
            ]}
            ariaLabel="Disk I/O Graph"
            formatData={(value: number) => convertBytesToTarget(ioUnit, value)}
            formatTooltip={(value: number) => readableBytes(value).formatted}
            nativeLegend
            subtitle={ioUnit + '/s'}
            title="Disk I/O"
            unit={'/s'}
            {...commonGraphProps}
          />
        </div>
      </Paper>
    </>
  );
};

export const formatCount = (value: null | number) => {
  if (!value) {
    return value;
  }
  return Math.round(value);
};
