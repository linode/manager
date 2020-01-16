import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import {
  LongviewProcesses,
  WithStartAndEnd
} from 'src/features/Longview/request.types';
import {
  convertData,
  formatMemory
} from 'src/features/Longview/shared/formatters';
import { statMax } from 'src/features/Longview/shared/utilities';
import { readableBytes } from 'src/utilities/unitConversions';
import { Process } from './types';
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(1) + 2,
    padding: theme.spacing(3)
  },
  graphWrap: {
    marginTop: theme.spacing(3)
  }
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

const ProcessesGraphs: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    error,
    processesData,
    processesLoading,
    selectedProcess,
    timezone,
    isToday,
    time,
    theme
  } = props;

  const { start, end } = time;

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
    end
  ]);

  const commonGraphProps = {
    timezone,
    showToday: isToday,
    loading: processesLoading,
    error
  };

  return (
    <>
      <Typography variant="h2">Process History{name && `: ${name}`}</Typography>
      <Paper className={classes.root}>
        <LongviewLineGraph
          title="CPU"
          subtitle="%"
          tooltipUnit="%"
          data={[
            {
              data: _convertData(cpu, start, end),
              label: 'CPU',
              borderColor: 'transparent',
              backgroundColor: theme.graphs.cpu.system
            }
          ]}
          {...commonGraphProps}
        />
        <div className={classes.graphWrap}>
          <LongviewLineGraph
            title="RAM"
            subtitle={memUnit}
            maxUnit={memUnit}
            data={[
              {
                data: _convertData(memory, start, end, formatMemory),
                label: 'RAM',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.memory.used
              }
            ]}
            {...commonGraphProps}
          />
        </div>
        <div className={classes.graphWrap}>
          <LongviewLineGraph
            title="Count"
            suggestedMax={10}
            data={[
              {
                data: _convertData(count, start, end, formatCount),
                label: 'Count',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.processCount
              }
            ]}
            {...commonGraphProps}
          />
        </div>
        <div className={classes.graphWrap}>
          <LongviewLineGraph
            title="Disk I/O"
            subtitle={ioUnit + '/s'}
            tooltipUnit={ioUnit + '/s'}
            nativeLegend
            data={[
              {
                label: 'Write',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.diskIO.write,
                data: _convertData(iowritekbytes, start, end, formatDisk)
              },
              {
                label: 'Read',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.diskIO.read,
                data: _convertData(ioreadkbytes, start, end, formatDisk)
              }
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
