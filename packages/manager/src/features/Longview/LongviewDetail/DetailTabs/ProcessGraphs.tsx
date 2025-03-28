import { convertBytesToTarget, readableBytes } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';

import { convertData, formatMemory } from '../../shared/formatters';
import {
  statMax,
  sumRelatedProcessesAcrossAllUsers,
} from '../../shared/utilities';
import { StyledSmallGraphGrid } from './CommonStyles.styles';

import type { LongviewProcesses } from '../../request.types';

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
      <Grid size={{ xs: 12 }}>
        <Grid container direction="row" spacing={2}>
          <StyledSmallGraphGrid size={{ sm: 6, xs: 12 }}>
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
          </StyledSmallGraphGrid>
          <StyledSmallGraphGrid size={{ sm: 6, xs: 12 }}>
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
          </StyledSmallGraphGrid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Grid container direction="row" spacing={2}>
          <StyledSmallGraphGrid size={{ sm: 6, xs: 12 }}>
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
          </StyledSmallGraphGrid>
          <StyledSmallGraphGrid size={{ sm: 6, xs: 12 }}>
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
          </StyledSmallGraphGrid>
        </Grid>
      </Grid>
    </>
  );
});
