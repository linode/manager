import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { LongviewProcesses, MySQLResponse } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import MySQLProcessGraphs from './MySQLProcessesGraphs';

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
  data?: MySQLResponse;
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

export const MySQLGraphs: React.FC<Props> = props => {
  const {
    data,
    error,
    isToday,
    loading,
    timezone,
    start,
    end,
    processesData,
    processesLoading,
    processesError
  } = props;

  const classes = useStyles();

  const _convertData = React.useCallback(convertData, [data, start, end]);

  return (
    <Paper className={classes.root}>
      <Grid container direction="column" spacing={0}>
        <Grid item xs={12}>
          <LongviewLineGraph
            title="Queries"
            subtitle="queries/s"
            nativeLegend
            error={error}
            loading={loading}
            showToday={isToday}
            timezone={timezone}
            data={[
              {
                label: 'SELECT',
                borderColor: 'rgba(34, 192, 206, 0.7)',
                backgroundColor: 'rgba(34, 192, 206, 0.7)',
                data: _convertData(
                  data?.Com_select ?? [],
                  start,
                  end,
                  formatData
                )
              },
              {
                label: 'UPDATE',
                borderColor: 'rgba(19, 110, 118, 0.7)',
                backgroundColor: 'rgba(19, 110, 118, 0.7)',
                data: _convertData(
                  data?.Com_update ?? [],
                  start,
                  end,
                  formatData
                )
              },
              {
                label: 'INSERT',
                borderColor: 'rgba(26, 151, 162, 0.7)',
                backgroundColor: 'rgba(26, 151, 162, 0.7)',
                data: _convertData(
                  data?.Com_insert ?? [],
                  start,
                  end,
                  formatData
                )
              },
              {
                label: 'DELETE',
                borderColor: 'rgba(2, 54, 59, 0.7)',
                backgroundColor: 'rgba(2, 54, 59, 0.7)',
                data: _convertData(
                  data?.Com_delete ?? [],
                  start,
                  end,
                  formatData
                )
              }
            ]}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Throughput"
                subtitle="KB/s"
                nativeLegend
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    label: 'Inbound',
                    borderColor: 'rgba(49, 206, 62, 0.7)',
                    backgroundColor: 'rgba(49, 206, 62, 0.7)',
                    data: _convertData(
                      data?.Bytes_received ?? [],
                      start,
                      end,
                      formatData
                    )
                  },
                  {
                    label: 'Outbound',
                    borderColor: 'rgba(16, 162, 29, 0.7)',
                    backgroundColor: 'rgba(16, 162, 29, 0.7)',
                    data: _convertData(
                      data?.Bytes_sent ?? [],
                      start,
                      end,
                      formatData
                    )
                  }
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Connections"
                subtitle="connections/s"
                nativeLegend
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    label: 'Connections',
                    borderColor: 'rgba(91, 105, 139, 0.7)',
                    backgroundColor: 'rgba(91, 105, 139, 0.7)',
                    data: _convertData(
                      data?.Connections ?? [],
                      start,
                      end,
                      formatData
                    )
                  }
                ]}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Slow Queries"
                nativeLegend
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    label: 'Slow Queries',
                    borderColor: 'rgba(255, 61, 61, 0.7)',
                    backgroundColor: 'rgba(255, 61, 61, 0.7)',
                    data: _convertData(
                      data?.Slow_queries ?? [],
                      start,
                      end,
                      formatData
                    )
                  }
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Aborted"
                nativeLegend
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    label: 'Connections',
                    borderColor: 'rgba(214, 0, 0, 0.7)',
                    backgroundColor: 'rgba(214, 0, 0, 0.7)',
                    data: _convertData(
                      data?.Aborted_connects ?? [],
                      start,
                      end,
                      formatAborted
                    )
                  },
                  {
                    label: 'Clients',
                    borderColor: 'rgba(255, 10, 10, 0.7)',
                    backgroundColor: 'rgba(255, 10, 10, 0.7)',
                    data: _convertData(
                      data?.Aborted_clients ?? [],
                      start,
                      end,
                      formatAborted
                    )
                  }
                ]}
              />
            </Grid>
          </Grid>
        </Grid>
        <MySQLProcessGraphs
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

const formatAborted = (value: number | null) => {
  if (value === null) {
    return value;
  }
  return Math.ceil(value);
};

export default MySQLGraphs;
