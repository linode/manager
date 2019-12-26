import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { LongviewNetworkInterface } from '../../../request.types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2)
  },
  graphSection: {
    paddingTop: theme.spacing(2)
  }
}));

interface Props {
  networkData: LongviewNetworkInterface;
  error?: APIError[];
  loading: boolean;
  timezone: string;
  isToday: boolean;
}

export const NetworkGraphs: React.FC<Props> = props => {
  const { error, isToday, loading, timezone } = props;
  const classes = useStyles();
  const _error = error ? error[0].reason : undefined;

  return (
    <Paper className={classes.root}>
      <Grid container direction="column" spacing={4}>
        <Grid item xs={12}>
          <LongviewLineGraph
            title="All Traffic"
            subtitle={'KB' + '/s'}
            error={_error}
            loading={loading}
            showToday={isToday}
            timezone={timezone}
            data={[]}
          />
        </Grid>
        <Grid item className={classes.graphSection}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6}>
              <LongviewLineGraph
                title="IPv4 Public"
                subtitle={'KB' + '/s'}
                error={_error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LongviewLineGraph
                title="IPv4 Private"
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
        <Grid item className={classes.graphSection}>
          <Grid container direction="row">
            <Grid item xs={12} sm={6}>
              <LongviewLineGraph
                title="IPv6 Public"
                subtitle={'KB' + '/s'}
                error={_error}
                loading={loading}
                showToday={isToday}
                timezone={timezone}
                data={[]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LongviewLineGraph
                title="IPv5 Private"
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

export default NetworkGraphs;
