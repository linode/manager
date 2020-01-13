import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  makeStyles,
  Theme,
  WithTheme,
  withTheme
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { ApacheResponse, LongviewProcesses } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import ApacheProcessGraphs from './ApacheProcessGraphs';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `${theme.spacing(3) + 2}px ${theme.spacing(3) +
      2}px ${theme.spacing(5) + 4}px`
  },
  smallGraph: {
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(3) + 2
    },
    marginTop: theme.spacing(6) + 3
  }
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

export const ApacheGraphs: React.FC<CombinedProps> = props => {
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
    processesError
  } = props;

  const classes = useStyles();

  const _convertData = React.useCallback(convertData, [data, start, end]);

  if (!data) {
    return null;
  }

  const workersWaiting = data.Workers['Waiting for Connection'];
  const workersStarting = data.Workers['Starting up'];
  const workersReading = data.Workers['Reading Request'];
  const workersSending = data.Workers['Sending Reply'];
  const workersKeepAlive = data.Workers['Keepalive'];
  const workersDNSLookup = data.Workers['DNS Lookup'];
  const workersClosing = data.Workers['Closing connection'];
  const workersLogging = data.Workers['Logging'];
  const workersFinishing = data.Workers['Gracefully finishing'];
  const workersCleanup = data.Workers['Idle cleanup of worker'];

  const totalKBytes = data['Total kBytes'];
  const totalAccesses = data['Total Accesses'];

  const graphProps = {
    timezone,
    showToday: isToday,
    loading,
    error
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
                data: _convertData(totalKBytes, start, end, formatData)
              }
            ]}
            {...graphProps}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Throughput"
                subtitle={'KB' + '/s'}
                data={[
                  {
                    label: 'Throughput',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.network.outbound,
                    data: _convertData(totalAccesses, start, end, formatData)
                  }
                ]}
                {...graphProps}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Workers"
                subtitle={'KB' + '/s'}
                nativeLegend
                data={[
                  {
                    label: 'Waiting',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.waiting,
                    data: _convertData(workersWaiting, start, end, formatData)
                  },
                  {
                    label: 'Starting',
                    borderColor: 'transparent',
                    backgroundColor: 'blue',
                    data: _convertData(workersStarting, start, end, formatData)
                  },
                  {
                    label: 'Reading',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.reading,
                    data: _convertData(workersReading, start, end, formatData)
                  },
                  {
                    label: 'Sending',
                    borderColor: 'rgba(26, 151, 162, 0.7)',
                    backgroundColor: 'rgba(26, 151, 162, 0.7)',
                    data: _convertData(workersSending, start, end, formatData)
                  },
                  {
                    label: 'Keepalive',
                    borderColor: 'rgba(26, 151, 162, 0.7)',
                    backgroundColor: 'rgba(26, 151, 162, 0.7)',
                    data: _convertData(workersKeepAlive, start, end, formatData)
                  },
                  {
                    label: 'DNS Lookup',
                    borderColor: 'rgba(26, 151, 162, 0.7)',
                    backgroundColor: 'rgba(26, 151, 162, 0.7)',
                    data: _convertData(workersDNSLookup, start, end, formatData)
                  },
                  {
                    label: 'Closing',
                    borderColor: 'rgba(26, 151, 162, 0.7)',
                    backgroundColor: 'rgba(26, 151, 162, 0.7)',
                    data: _convertData(workersClosing, start, end, formatData)
                  },
                  {
                    label: 'Logging',
                    borderColor: 'rgba(26, 151, 162, 0.7)',
                    backgroundColor: 'rgba(26, 151, 162, 0.7)',
                    data: _convertData(workersLogging, start, end, formatData)
                  },
                  {
                    label: 'Finishing',
                    borderColor: 'rgba(26, 151, 162, 0.7)',
                    backgroundColor: 'rgba(26, 151, 162, 0.7)',
                    data: _convertData(workersFinishing, start, end, formatData)
                  },
                  {
                    label: 'Cleanup',
                    borderColor: 'rgba(26, 151, 162, 0.7)',
                    backgroundColor: 'rgba(26, 151, 162, 0.7)',
                    data: _convertData(workersCleanup, start, end, formatData)
                  }
                ]}
                {...graphProps}
              />
            </Grid>
          </Grid>
        </Grid>
        <ApacheProcessGraphs
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
)(ApacheGraphs);
export default enhanced;
