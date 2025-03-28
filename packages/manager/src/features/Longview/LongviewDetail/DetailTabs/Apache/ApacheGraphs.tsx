import { roundTo } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';
import {
  convertNetworkToUnit,
  formatNetworkTooltip,
  generateNetworkUnits,
  statMax,
} from 'src/features/Longview/shared/utilities';

import { convertData } from '../../../shared/formatters';
import { StyledRootPaper, StyledSmallGraphGrid } from '../CommonStyles.styles';
import { ProcessGraphs } from '../ProcessGraphs';

import type { ApacheResponse, LongviewProcesses } from '../../../request.types';

interface Props {
  data?: ApacheResponse;
  end: number;
  error?: string;
  isToday: boolean;
  loading: boolean;
  processesData: LongviewProcesses;
  processesError?: string;
  processesLoading: boolean;
  start: number;
  timezone: string;
}

export const ApacheGraphs = React.memo((props: Props) => {
  const {
    data,
    end,
    error,
    isToday,
    loading,
    processesData,
    processesError,
    processesLoading,
    start,
    timezone,
  } = props;

  const theme = useTheme();

  const _convertData = React.useCallback(convertData, [data, start, end]);

  const workersWaiting = data?.Workers['Waiting for Connection'] ?? [];
  const workersStarting = data?.Workers['Starting up'] ?? [];
  const workersReading = data?.Workers['Reading Request'] ?? [];
  const workersSending = data?.Workers['Sending Reply'] ?? [];
  const workersKeepAlive = data?.Workers['Keepalive'] ?? [];
  const workersDNSLookup = data?.Workers['DNS Lookup'] ?? [];
  const workersClosing = data?.Workers['Closing connection'] ?? [];
  const workersLogging = data?.Workers['Logging'] ?? [];
  const workersFinishing = data?.Workers['Gracefully finishing'] ?? [];
  const workersCleanup = data?.Workers['Idle cleanup of worker'] ?? [];

  const totalKBytes = data?.['Total kBytes'] ?? [];
  const totalAccesses = data?.['Total Accesses'] ?? [];

  /**
   * NB: unlike some other places in Longview,
   * totalKBytes appears to actually be returned
   * in kilobytes (usually it's bytes, even if the variable name
   * has kb in it). Our network helper utilities
   * aren't prepared for this, so we have to convert
   * to bytes by passing a formatter to convertData.
   *
   * Conversion from bytes to bits takes place inside the helpers.
   */
  const networkUnit = React.useMemo(
    () => generateNetworkUnits(statMax(totalKBytes)),
    [totalKBytes]
  );

  const graphProps = {
    error,
    loading,
    nativeLegend: true,
    showToday: isToday,
    timezone,
  };

  return (
    <StyledRootPaper>
      <Grid container direction="column" spacing={0}>
        <Grid size={{ xs: 12 }}>
          <LongviewLineGraph
            data={[
              {
                backgroundColor: theme.graphs.requests,
                borderColor: 'transparent',
                data: _convertData(totalAccesses, start, end),
                label: 'Requests',
              },
            ]}
            ariaLabel="Requests Per Second Graph"
            subtitle="requests/s"
            title="Requests"
            {...graphProps}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Grid container direction="row">
            <StyledSmallGraphGrid size={{ sm: 6, xs: 12 }}>
              <LongviewLineGraph
                data={[
                  {
                    backgroundColor: theme.graphs.lightGreen,
                    borderColor: 'transparent',
                    data: _convertData(
                      totalKBytes,
                      start,
                      end,
                      kilobytesToBytes
                    ),
                    label: 'Throughput',
                  },
                ]}
                formatData={(value: number) =>
                  roundTo(convertNetworkToUnit(value * 8, networkUnit))
                }
                ariaLabel="Throughput Graph"
                formatTooltip={formatNetworkTooltip}
                subtitle={`${networkUnit}/s`}
                title="Throughput"
                unit={'/s'}
                {...graphProps}
              />
            </StyledSmallGraphGrid>
            <StyledSmallGraphGrid size={{ sm: 6, xs: 12 }}>
              <LongviewLineGraph
                data={[
                  {
                    backgroundColor: theme.graphs.workers.waiting,
                    borderColor: 'transparent',
                    data: _convertData(workersWaiting, start, end),
                    label: 'Waiting',
                  },
                  {
                    backgroundColor: theme.graphs.workers.starting,
                    borderColor: 'transparent',
                    data: _convertData(workersStarting, start, end),
                    label: 'Starting',
                  },
                  {
                    backgroundColor: theme.graphs.workers.reading,
                    borderColor: 'transparent',
                    data: _convertData(workersReading, start, end),
                    label: 'Reading',
                  },
                  {
                    backgroundColor: theme.graphs.workers.sending,
                    borderColor: 'transparent',
                    data: _convertData(workersSending, start, end),
                    label: 'Sending',
                  },
                  {
                    backgroundColor: theme.graphs.workers.keepAlive,
                    borderColor: 'transparent',
                    data: _convertData(workersKeepAlive, start, end),
                    label: 'Keepalive',
                  },
                  {
                    backgroundColor: theme.graphs.workers.DNSLookup,
                    borderColor: 'transparent',
                    data: _convertData(workersDNSLookup, start, end),
                    label: 'DNS Lookup',
                  },
                  {
                    backgroundColor: theme.graphs.workers.closing,
                    borderColor: 'transparent',
                    data: _convertData(workersClosing, start, end),
                    label: 'Closing',
                  },
                  {
                    backgroundColor: theme.graphs.workers.logging,
                    borderColor: 'transparent',
                    data: _convertData(workersLogging, start, end),
                    label: 'Logging',
                  },
                  {
                    backgroundColor: theme.graphs.workers.finishing,
                    borderColor: 'transparent',
                    data: _convertData(workersFinishing, start, end),
                    label: 'Finishing',
                  },
                  {
                    backgroundColor: theme.graphs.workers.cleanup,
                    borderColor: 'transparent',
                    data: _convertData(workersCleanup, start, end),
                    label: 'Cleanup',
                  },
                ]}
                ariaLabel="Workers Graph"
                title="Workers"
                {...graphProps}
              />
            </StyledSmallGraphGrid>
          </Grid>
        </Grid>
        <ProcessGraphs
          data={processesData}
          end={end}
          error={processesError || error}
          isToday={isToday}
          loading={processesLoading}
          start={start}
          timezone={timezone}
        />
      </Grid>
    </StyledRootPaper>
  );
});

export const kilobytesToBytes = (value: null | number) => {
  if (value === null) {
    return null;
  }
  return value * 1024;
};
