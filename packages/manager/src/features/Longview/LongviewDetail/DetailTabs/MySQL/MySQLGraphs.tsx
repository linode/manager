import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { withTheme, WithTheme } from '@mui/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import {
  formatNetworkTooltip,
  getMaxUnitAndFormatNetwork,
} from 'src/features/Longview/shared/utilities';
import { LongviewProcesses, MySQLResponse } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import ProcessGraphs, { useStyles } from '../ProcessGraphs';

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

export const MySQLGraphs: React.FC<CombinedProps> = (props) => {
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
    theme,
    timezone,
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

  const { formatNetwork, maxUnit } = getMaxUnitAndFormatNetwork(
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
            ariaLabel="Queries Per Second Graph"
            nativeLegend
            error={error}
            loading={loading}
            showToday={isToday}
            timezone={timezone}
            data={[
              {
                backgroundColor: theme.graphs.queries.select,
                borderColor: 'transparent',
                data: _convertData(selectQueries, start, end),
                label: 'SELECT',
              },
              {
                backgroundColor: theme.graphs.queries.update,
                borderColor: 'transparent',
                data: _convertData(updateQueries, start, end),
                label: 'UPDATE',
              },
              {
                backgroundColor: theme.graphs.queries.insert,
                borderColor: 'transparent',
                data: _convertData(insertQueries, start, end),
                label: 'INSERT',
              },
              {
                backgroundColor: theme.graphs.queries.delete,
                borderColor: 'transparent',
                data: _convertData(deleteQueries, start, end),
                label: 'DELETE',
              },
            ]}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Throughput"
                subtitle={`${maxUnit}/s`}
                unit={'/s'}
                ariaLabel="Throughput Graph"
                formatData={formatNetwork}
                formatTooltip={formatNetworkTooltip}
                nativeLegend
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    backgroundColor: theme.graphs.network.inbound,
                    borderColor: 'transparent',
                    data: _convertData(inbound, start, end),
                    label: 'Inbound',
                  },
                  {
                    backgroundColor: theme.graphs.network.outbound,
                    borderColor: 'transparent',
                    data: _convertData(outbound, start, end),
                    label: 'Outbound',
                  },
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Connections"
                subtitle="connections/s"
                unit={' connections/s'}
                ariaLabel="Connections Per Second Graph"
                nativeLegend
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    backgroundColor: theme.graphs.connections.accepted,
                    borderColor: 'transparent',
                    data: _convertData(connections, start, end),
                    label: 'Connections',
                  },
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
                ariaLabel="Slow Queries Graph"
                nativeLegend
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    backgroundColor: theme.graphs.slowQueries,
                    borderColor: 'transparent',
                    data: _convertData(slowQueries, start, end),
                    label: 'Slow Queries',
                  },
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Aborted"
                ariaLabel="Aborted Clients and Connections Graph"
                nativeLegend
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    backgroundColor: theme.graphs.aborted.connections,
                    borderColor: 'transparent',
                    data: _convertData(
                      abortedConnections,
                      start,
                      end,
                      formatAborted
                    ),
                    label: 'Connections',
                  },
                  {
                    backgroundColor: theme.graphs.aborted.clients,
                    borderColor: 'transparent',
                    data: _convertData(
                      abortedClients,
                      start,
                      end,
                      formatAborted
                    ),
                    label: 'Clients',
                  },
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
