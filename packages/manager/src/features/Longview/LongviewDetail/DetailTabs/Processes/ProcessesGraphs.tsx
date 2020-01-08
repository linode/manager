import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import {
  LongviewProcesses,
  WithStartAndEnd
} from 'src/features/Longview/request.types';
import { convertData } from 'src/features/Longview/shared/formatters';
import { statMax } from 'src/features/Longview/shared/utilities';
import { readableBytes } from 'src/utilities/unitConversions';
// import { formatDisk } from '../OverviewGraphs/DiskGraph';
import { formatMemory } from '../../../shared/formatters';
import { formatCPU } from '../OverviewGraphs/CPUGraph';
import { Process } from './common';
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3)
  }
}));

interface Props {
  processesData: LongviewProcesses;
  processesLoading: boolean;
  processesError?: APIError[];
  selectedProcess: Process | null;
  clientAPIKey: string;
  timezone: string;
  lastUpdated?: number;
  lastUpdatedError: boolean;
  isToday: boolean;
  time: WithStartAndEnd;
}

type CombinedProps = Props & WithTheme;

const ProcessesGraphs: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    processesError,
    processesData,
    processesLoading,
    selectedProcess,
    lastUpdatedError,
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
    showToday: isToday
  };

  const _hasError = processesError || lastUpdatedError;
  const errorMessage = Boolean(_hasError)
    ? _hasError?.[0]?.reason ?? 'Error retrieving data'
    : undefined;

  return (
    <>
      <Paper className={classes.root}>
        <LongviewLineGraph
          title="CPU"
          subtitle="%"
          loading={processesLoading}
          error={errorMessage}
          data={[
            {
              data: _convertData(cpu, start, end, formatCPU),
              label: 'CPU',
              borderColor: theme.graphs.deepBlue,
              backgroundColor: theme.graphs.deepBlueBorder
            }
          ]}
          {...commonGraphProps}
        />
        <LongviewLineGraph
          title="RAM"
          subtitle={memUnit}
          loading={processesLoading}
          error={errorMessage}
          data={[
            {
              data: _convertData(memory, start, end, formatMemory),
              label: 'RAM',
              borderColor: theme.graphs.purple,
              backgroundColor: theme.graphs.purpleBorder
            }
          ]}
          {...commonGraphProps}
        />
        <LongviewLineGraph
          title="Count"
          loading={processesLoading}
          error={errorMessage}
          data={[
            {
              data: _convertData(count, start, end, formatCount),
              label: 'Count',
              borderColor: theme.graphs.deepBlue,
              backgroundColor: theme.graphs.deepBlueBorder
            }
          ]}
          {...commonGraphProps}
        />
        <LongviewLineGraph
          title="Disk I/O"
          subtitle={ioUnit + '/s'}
          loading={processesLoading}
          error={errorMessage}
          data={[
            {
              label: 'Write',
              borderColor: theme.graphs.lightOrangeBorder,
              backgroundColor: theme.graphs.lightOrange,
              data: _convertData(iowritekbytes, start, end, formatDisk)
            },
            {
              label: 'Read',
              borderColor: theme.graphs.lightYellowBorder,
              backgroundColor: theme.graphs.lightYellow,
              data: _convertData(ioreadkbytes, start, end, formatDisk)
            }
          ]}
          {...commonGraphProps}
        />
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
