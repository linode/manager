import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  makeStyles,
  Theme,
  WithTheme,
  withTheme,
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import {
  convertNetworkToUnit,
  formatNetworkTooltip,
  generateNetworkUnits,
  statMax,
} from 'src/features/Longview/shared/utilities';
import roundTo from 'src/utilities/roundTo';
import { ApacheResponse, LongviewProcesses } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import ProcessGraphs from '../ProcessGraphs';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `${theme.spacing(3) + 2}px ${theme.spacing(3) +
      2}px ${theme.spacing(5) + 4}px`,
  },
  smallGraph: {
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(3) + 2,
    },
    marginTop: theme.spacing(6) + 3,
  },
}));

interface Props {
  data?: ApacheResponse;
  error?: string;
  loading: boolean;
  timezone: string;
  isToday: boolean;
  start: number;
  end: number;
  processesData: LongviewProcesses;
  processesLoading: boolean;
  processesError?: string;
}

type CombinedProps = Props & WithTheme;

export const ApacheGraphs: React.FC<CombinedProps> = (props) => {
  const {
    data,
    error,
    isToday,
    loading,
    timezone,
    start,
    end,
    theme,
    processesData,
    processesLoading,
    processesError,
  } = props;

  const classes = useStyles();

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
    timezone,
    showToday: isToday,
    loading,
    error,
    nativeLegend: true,
  };

  return (
    <Paper className={classes.root}>
      <Grid container direction="column" spacing={0}>
        <Grid item xs={12}>
          <LongviewLineGraph
            title="Requests"
            subtitle="requests/s"
            data={[
              {
                label: 'Requests',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.requests,
                data: _convertData(totalAccesses, start, end),
              },
            ]}
            {...graphProps}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Throughput"
                subtitle={`${networkUnit}/s`}
                unit={'/s'}
                formatData={(value: number) =>
                  roundTo(convertNetworkToUnit(value * 8, networkUnit))
                }
                formatTooltip={formatNetworkTooltip}
                data={[
                  {
                    label: 'Throughput',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.network.outbound,
                    data: _convertData(
                      totalKBytes,
                      start,
                      end,
                      kilobytesToBytes
                    ),
                  },
                ]}
                {...graphProps}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Workers"
                data={[
                  {
                    label: 'Waiting',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.waiting,
                    data: _convertData(workersWaiting, start, end),
                  },
                  {
                    label: 'Starting',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.starting,
                    data: _convertData(workersStarting, start, end),
                  },
                  {
                    label: 'Reading',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.reading,
                    data: _convertData(workersReading, start, end),
                  },
                  {
                    label: 'Sending',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.sending,
                    data: _convertData(workersSending, start, end),
                  },
                  {
                    label: 'Keepalive',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.keepAlive,
                    data: _convertData(workersKeepAlive, start, end),
                  },
                  {
                    label: 'DNS Lookup',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.DNSLookup,
                    data: _convertData(workersDNSLookup, start, end),
                  },
                  {
                    label: 'Closing',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.closing,
                    data: _convertData(workersClosing, start, end),
                  },
                  {
                    label: 'Logging',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.logging,
                    data: _convertData(workersLogging, start, end),
                  },
                  {
                    label: 'Finishing',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.finishing,
                    data: _convertData(workersFinishing, start, end),
                  },
                  {
                    label: 'Cleanup',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.cleanup,
                    data: _convertData(workersCleanup, start, end),
                  },
                ]}
                {...graphProps}
              />
            </Grid>
          </Grid>
        </Grid>
        <ProcessGraphs
          data={processesData}
          loading={processesLoading}
          error={processesError || error}
          timezone={timezone}
          isToday={isToday}
          start={start}
          end={end}
        />
      </Grid>
    </Paper>
  );
};

export const kilobytesToBytes = (value: number | null) => {
  if (value === null) {
    return null;
  }
  return value * 1024;
};

const enhanced = compose<CombinedProps, Props>(
  withTheme,
  React.memo
)(ApacheGraphs);
export default enhanced;
