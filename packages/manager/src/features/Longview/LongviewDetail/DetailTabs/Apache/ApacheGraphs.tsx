import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { ApacheResponse } from '../../../request.types';
import { convertData } from '../../../shared/formatters';

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
  // processesData: LongviewProcesses;
  // processesLoading: boolean;
  // processesError?: string;
}

export const ApacheGraphs: React.FC<Props> = props => {
  const {
    data,
    error,
    isToday,
    loading,
    timezone,
    start,
    end,
    // processesData,
    // processesLoading,
    // processesError
  } = props;

  const classes = useStyles();

  const _convertData = React.useCallback(convertData, [data, start, end]);

  if (!data) {
    return null;
  }

  const workersWaiting = data.workers['Waiting for Connection'];
  const workersStarting = data.workers['Starting up'];
  const workersReading = data.workers['Reading Request'];
  const workersSending = data.workers['Sending Reply'];
  const workersKeepAlive = data.workers['Keepalive'];
  const workersDNSLookup = data.workers['DNS Lookup'];
  const workersClosing = data.workers['Closing connection'];
  const workersLogging = data.workers['Logging'];
  const workersFinishing = data.workers['Gracefully finishing'];
  const workersCleanup = data.workers['Idle cleanup of worker'];
  console.log(data.workers);
  return (
    <Paper className={classes.root}>
      <Grid container direction="column" spacing={0}>
        <Grid item xs={12}>
        {/* <LongviewLineGraph
                title="Workers"
                subtitle={'KB' + '/s'}
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    label: 'Waiting',
                    borderColor: 'rgba(34, 192, 206, 0.7)',
                    backgroundColor: 'rgba(34, 192, 206, 0.7)',
                    data: _convertData(workersWaiting, start, end, formatData)
                  },
                  {
                    label: 'Starting',
                    borderColor: 'rgba(34, 192, 206, 0.7)',
                    backgroundColor: 'rgba(34, 192, 206, 0.7)',
                    data: _convertData(workersStarting, start, end, formatData)
                  },
                  {
                    label: 'Reading',
                    borderColor: 'rgba(19, 110, 118, 0.7)',
                    backgroundColor: 'rgba(19, 110, 118, 0.7)',
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
              /> */}
            </Grid>




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

export default ApacheGraphs;
