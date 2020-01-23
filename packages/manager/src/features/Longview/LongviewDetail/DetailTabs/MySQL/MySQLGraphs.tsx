import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { getMaxUnitAndFormatNetwork } from 'src/features/Longview/shared/utilities';
import { LongviewProcesses, MySQLResponse } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import ProcessGraphs from '../ProcessGraphs';

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

type CombinedProps = Props & WithTheme;

export const MySQLGraphs: React.FC<CombinedProps> = props => {
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
    processesError,
    theme
  } = props;

  const classes = useStyles();

  const _convertData = React.useCallback(convertData, [data, start, end]);

  const selectQueries = data?.Com_select ?? [];
  const updateQueries = data?.Com_update ?? [];
  const insertQueries = data?.Com_insert ?? [];
  const deleteQueries = data?.Com_delete ?? [];
  const abortedConnections = data?.Aborted_connects ?? [];
  const abortedClients = data?.Aborted_clients ?? [];
  const slowQueries = data?.Slow_queries ?? [];
  const connections = data?.Connections ?? [];
  const inbound = data?.Bytes_received ?? [];
  const outbound = data?.Bytes_sent ?? [];

  const { maxUnit: netMaxUnit, formatNetwork } = getMaxUnitAndFormatNetwork(
    inbound,
    outbound
  );

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
                borderColor: 'transparent',
                backgroundColor: theme.graphs.queries.select,
                data: _convertData(selectQueries, start, end)
              },
              {
                label: 'UPDATE',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.queries.update,
                data: _convertData(updateQueries, start, end)
              },
              {
                label: 'INSERT',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.queries.insert,
                data: _convertData(insertQueries, start, end)
              },
              {
                label: 'DELETE',
                borderColor: 'transparent',
                backgroundColor: theme.graphs.queries.delete,
                data: _convertData(deleteQueries, start, end)
              }
            ]}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Throughput"
                subtitle={`${netMaxUnit}/s`}
                nativeLegend
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    label: 'Inbound',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.network.inbound,
                    data: _convertData(inbound, start, end, formatNetwork)
                  },
                  {
                    label: 'Outbound',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.network.outbound,
                    data: _convertData(outbound, start, end, formatNetwork)
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
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.connections.accepted,
                    data: _convertData(connections, start, end)
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
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.slowQueries,
                    data: _convertData(slowQueries, start, end)
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
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.aborted.connections,
                    data: _convertData(
                      abortedConnections,
                      start,
                      end,
                      formatAborted
                    )
                  },
                  {
                    label: 'Clients',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.aborted.clients,
                    data: _convertData(
                      abortedClients,
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

const formatAborted = (value: number | null) => {
  if (value === null) {
    return value;
  }
  return Math.ceil(value);
};

export default withTheme(MySQLGraphs);
