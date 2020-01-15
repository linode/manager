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
import { LongviewProcesses, NginxResponse } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import NGINXProcessGraphs from './NGINXProcessGraphs';

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

export const NGINXGraphs: React.FC<CombinedProps> = props => {
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

  const graphProps = {
    error,
    timezone,
    loading,
    showToday: isToday,
    nativeLegend: true
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
                data: _convertData(data?.requests ?? [], start, end, formatData)
              }
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
                nativeLegend
                data={[
                  {
                    label: 'Accepted',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.connections.accepted,
                    data: _convertData(
                      data?.accepted_cons ?? [],
                      start,
                      end,
                      formatData
                    )
                  },
                  {
                    label: 'Handled',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.connections.handled,
                    data: _convertData(
                      data?.handled_cons ?? [],
                      start,
                      end,
                      formatData
                    )
                  }
                ]}
                {...graphProps}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Workers"
                nativeLegend
                data={[
                  {
                    label: 'Waiting',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.waiting,
                    data: _convertData(
                      data?.waiting ?? [],
                      start,
                      end,
                      formatData
                    )
                  },
                  {
                    label: 'Reading',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.reading,
                    data: _convertData(
                      data?.reading ?? [],
                      start,
                      end,
                      formatData
                    )
                  },
                  {
                    label: 'Writing',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.workers.writing,
                    data: _convertData(
                      data?.writing ?? [],
                      start,
                      end,
                      formatData
                    )
                  }
                ]}
                {...graphProps}
              />
            </Grid>
          </Grid>
        </Grid>
        <NGINXProcessGraphs
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
  return Math.round(value * 10000) / 10000;
};

const enhanced = compose<CombinedProps, Props>(
  withTheme,
  React.memo
)(NGINXGraphs);
export default enhanced;
