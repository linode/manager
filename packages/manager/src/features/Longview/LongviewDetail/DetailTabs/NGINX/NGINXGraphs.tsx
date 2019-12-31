import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { NginxResponse, NginxUserProcesses } from '../../../request.types';
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
  processesData: NginxUserProcesses;
  processesLoading: boolean;
  processesError?: string;
}

export const NGINXGraphs: React.FC<Props> = props => {
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
            title="Requests"
            error={error}
            loading={loading}
            showToday={isToday}
            timezone={timezone}
            unit="/s"
            data={[
              {
                label: 'Requests',
                borderColor: '#22ceb6',
                backgroundColor: '#22ceb6',
                data: _convertData(data?.requests ?? [], start, end, formatData)
              }
            ]}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Connections"
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                unit="/s"
                data={[
                  {
                    label: 'Accepted',
                    borderColor: '#5b698b',
                    backgroundColor: '#5b698b',
                    data: _convertData(
                      data?.accepted_cons ?? [],
                      start,
                      end,
                      formatData
                    )
                  },
                  {
                    label: 'Handled',
                    borderColor: '#323b4d',
                    backgroundColor: '#323b4d',
                    data: _convertData(
                      data?.handled_cons ?? [],
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
                title="Workers"
                error={error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[
                  {
                    label: 'Waiting',
                    borderColor: '#63d997',
                    backgroundColor: '#63d997',
                    data: _convertData(
                      data?.waiting ?? [],
                      start,
                      end,
                      formatData
                    )
                  },
                  {
                    label: 'Reading',
                    borderColor: '#2db969',
                    backgroundColor: '#2db969',
                    data: _convertData(
                      data?.reading ?? [],
                      start,
                      end,
                      formatData
                    )
                  },
                  {
                    label: 'Writing',
                    borderColor: '#20834b',
                    backgroundColor: '#20834b',
                    data: _convertData(
                      data?.writing ?? [],
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
  return Math.round(value * 100) / 100;
};

export default NGINXGraphs;
