import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { ApacheResponse } from '../../../request.types';

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
  error?: APIError[];
  loading: boolean;
  timezone: string;
  isToday: boolean;
}

export const ApacheGraphs: React.FC<Props> = props => {
  const { data, error, isToday, loading, timezone } = props;
  const classes = useStyles();
  const _error = error ? error[0].reason : undefined;

  if (!data) {
    return null;
  }

  return (
    <Paper className={classes.root}>
      <Grid container direction="column" spacing={0}>
        <Grid item xs={12}>
          <LongviewLineGraph
            title="Requests"
            subtitle={'KB' + '/s'}
            error={_error}
            loading={loading}
            showToday={isToday}
            timezone={timezone}
            data={[]}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Throughput"
                subtitle={'KB' + '/s'}
                error={_error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[]}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Workers"
                subtitle={'KB' + '/s'}
                error={_error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[]}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="CPU"
                subtitle={'KB' + '/s'}
                error={_error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[]}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="RAM"
                subtitle={'KB' + '/s'}
                error={_error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[]}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Disk I/O"
                subtitle={'KB' + '/s'}
                error={_error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[]}
              />
            </Grid>
            <Grid item xs={12} sm={6} className={classes.smallGraph}>
              <LongviewLineGraph
                title="Process Count"
                subtitle={'KB' + '/s'}
                error={_error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[]}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ApacheGraphs;
