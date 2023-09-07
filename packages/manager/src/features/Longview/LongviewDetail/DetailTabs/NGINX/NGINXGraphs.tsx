import { WithTheme, withTheme } from '@mui/styles';
import * as React from 'react';
import { compose } from 'recompose';

import { Grid } from 'src/components/Grid';
import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';
import { Paper } from 'src/components/Paper';

import { LongviewProcesses, NginxResponse } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import ProcessGraphs, { useStyles } from '../ProcessGraphs';

interface Props {
  data?: NginxResponse;
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
            data={[
              {
                backgroundColor: theme.graphs.requests,
                borderColor: 'transparent',
                data: _convertData(data?.requests ?? [], start, end),
                label: 'Requests',
              },
            ]}
            ariaLabel="Requests Per Second Graph"
            subtitle="requests/s"
            title="Requests"
            unit=" requests/s"
            {...graphProps}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row" spacing={2}>
            <Grid className={classes.smallGraph} item sm={6} xs={12}>
              <LongviewLineGraph
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
                ariaLabel="Connections Per Second Graph"
                subtitle="connections/s"
                title="Connections"
                unit=" connections/s"
                {...graphProps}
              />
            </Grid>
            <Grid className={classes.smallGraph} item sm={6} xs={12}>
              <LongviewLineGraph
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
                ariaLabel="Workers Graph"
                title="Workers"
                {...graphProps}
              />
            </Grid>
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
    </Paper>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withTheme,
  React.memo
)(NGINXGraphs);
export default enhanced;
