import { Box, Paper, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';
import {
  convertData,
  formatMemory,
} from 'src/features/Longview/shared/formatters';
import { statMax } from 'src/features/Longview/shared/utilities';
import {
  convertBytesToTarget,
  readableBytes,
} from 'src/utilities/unitConversions';

import type { Process } from './types';
import type {
  LongviewProcesses,
  WithStartAndEnd,
} from 'src/features/Longview/request.types';

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
  // @ts-expect-error The types are completely wrong. They don't account for "user"
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
      <Typography
        sx={{
          [theme.breakpoints.down('lg')]: {
            marginLeft: theme.spacing(),
          },
        }}
        variant="h2"
      >
        Process History{name && `: ${name}`}
      </Typography>
      <Paper
        sx={{
          marginTop: theme.spacing(1.25),
          padding: theme.spacing(3),
        }}
      >
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
        <Box marginTop={theme.spacing(3)}>
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
        </Box>
        <Box marginTop={theme.spacing(3)}>
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
        </Box>
        <Box marginTop={theme.spacing(3)}>
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
        </Box>
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
