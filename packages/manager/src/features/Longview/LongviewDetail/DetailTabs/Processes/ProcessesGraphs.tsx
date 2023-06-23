import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, withTheme, WithTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
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

const useStyles = makeStyles((theme: Theme) => ({
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
  processesData: LongviewProcesses;
  processesLoading: boolean;
  error?: string;
  selectedProcess: Process | null;
  clientAPIKey: string;
  timezone: string;
  lastUpdated?: number;
  isToday: boolean;
  time: WithStartAndEnd;
}

type CombinedProps = Props & WithTheme;

const ProcessesGraphs: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    error,
    isToday,
    processesData,
    processesLoading,
    selectedProcess,
    theme,
    time,
    timezone,
  } = props;

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

  const formatDisk = (value: number | null) => {
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
      <Typography variant="h2" className={classes.title}>
        Process History{name && `: ${name}`}
      </Typography>
      <Paper className={classes.root}>
        <LongviewLineGraph
          title="CPU"
          subtitle="%"
          unit="%"
          ariaLabel="CPU Usage Graph"
          data={[
            {
              backgroundColor: theme.graphs.cpu.system,
              borderColor: 'transparent',
              data: _convertData(cpu, start, end),
              label: 'CPU',
            },
          ]}
          {...commonGraphProps}
        />
        <div className={classes.graphWrap}>
          <LongviewLineGraph
            title="RAM"
            subtitle={memUnit}
            ariaLabel="RAM Usage Graph"
            formatData={(value: number) => convertBytesToTarget(memUnit, value)}
            formatTooltip={(value: number) => readableBytes(value).formatted}
            data={[
              {
                backgroundColor: theme.graphs.memory.used,
                borderColor: 'transparent',
                data: _convertData(memory, start, end, formatMemory),
                label: 'RAM',
              },
            ]}
            {...commonGraphProps}
          />
        </div>
        <div className={classes.graphWrap}>
          <LongviewLineGraph
            title="Count"
            suggestedMax={10}
            ariaLabel="Process Count Graph"
            data={[
              {
                backgroundColor: theme.graphs.processCount,
                borderColor: 'transparent',
                data: _convertData(count, start, end, formatCount),
                label: 'Count',
              },
            ]}
            {...commonGraphProps}
          />
        </div>
        <div className={classes.graphWrap}>
          <LongviewLineGraph
            title="Disk I/O"
            subtitle={ioUnit + '/s'}
            unit={'/s'}
            ariaLabel="Disk I/O Graph"
            formatData={(value: number) => convertBytesToTarget(ioUnit, value)}
            formatTooltip={(value: number) => readableBytes(value).formatted}
            nativeLegend
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
            {...commonGraphProps}
          />
        </div>
      </Paper>
    </>
  );
};

export default withTheme(ProcessesGraphs);

export const formatCount = (value: number | null) => {
  if (!value) {
    return value;
  }
  return Math.round(value);
};
