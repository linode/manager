import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { WithTheme, withTheme } from '@mui/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { LongviewProcesses, NginxResponse } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import ProcessGraphs, { useStyles } from '../ProcessGraphs';

interface Props {
  data?: NginxResponse;
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

export const NGINXGraphs: React.FC<CombinedProps> = (props) => {
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

  const graphProps = {
    error,
    loading,
    nativeLegend: true,
    showToday: isToday,
    timezone,
  };

  return (
    <Paper className={classes.root}>
      <Grid container direction="column" spacing={0}>
        <Grid item xs={12}>
          <LongviewLineGraph
            title="Requests"
            subtitle="requests/s"
            unit=" requests/s"
            ariaLabel="Requests Per Second Graph"
            data={[
              {
                backgroundColor: theme.graphs.requests,
                borderColor: 'transparent',
                data: _convertData(data?.requests ?? [], start, end),
                label: 'Requests',
              },
            ]}
            {...graphProps}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Connections"
                subtitle="connections/s"
                unit=" connections/s"
                ariaLabel="Connections Per Second Graph"
                data={[
                  {
                    backgroundColor: theme.graphs.connections.accepted,
                    borderColor: 'transparent',
                    data: _convertData(data?.accepted_cons ?? [], start, end),
                    label: 'Accepted',
                  },
                  {
                    backgroundColor: theme.graphs.connections.handled,
                    borderColor: 'transparent',
                    data: _convertData(data?.handled_cons ?? [], start, end),
                    label: 'Handled',
                  },
                ]}
                {...graphProps}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Workers"
                ariaLabel="Workers Graph"
                data={[
                  {
                    backgroundColor: theme.graphs.workers.waiting,
                    borderColor: 'transparent',
                    data: _convertData(data?.waiting ?? [], start, end),
                    label: 'Waiting',
                  },
                  {
                    backgroundColor: theme.graphs.workers.reading,
                    borderColor: 'transparent',
                    data: _convertData(data?.reading ?? [], start, end),
                    label: 'Reading',
                  },
                  {
                    backgroundColor: theme.graphs.workers.writing,
                    borderColor: 'transparent',
                    data: _convertData(data?.writing ?? [], start, end),
                    label: 'Writing',
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

const enhanced = compose<CombinedProps, Props>(
  withTheme,
  React.memo
)(NGINXGraphs);
export default enhanced;
