import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';

import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
// import Select from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import { Props as LVDataProps } from 'src/containers/longview.stats.container';

import ActiveConnections from './ActiveConnections';
import IconSection from './IconSection';
import ListeningServices from './ListeningServices';

import { LongviewTopProcesses } from 'src/features/Longview/request.types';

const useStyles = makeStyles((theme: Theme) => ({
  paperSection: {
    padding: theme.spacing(3) + 1,
    marginBottom: theme.spacing(1) + 3
  },
  detailsLink: {
    fontSize: 16,
    fontWeight: 'bold',
    position: 'relative',
    top: 3
  }
}));

interface Props {
  client: string;
  longviewClientData: LVDataProps['longviewClientData'];
  topProcessesData: LongviewTopProcesses;
  topProcessesLoading: boolean;
  topProcessesError?: APIError[];
  lastUpdatedError?: APIError[];
}

export type CombinedProps = RouteComponentProps<{ id: string }> & Props;

export const LongviewDetailOverview: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const {
    topProcessesData,
    topProcessesLoading,
    topProcessesError,
    lastUpdatedError
  } = props;

  const url = pathOr('', ['match', 'url'], props);

  return (
    <React.Fragment>
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paperSection}>
            <Grid container justify="space-between" item xs={12} spacing={0}>
              <IconSection
                longviewClientData={props.longviewClientData}
                client={props.client}
              />

              <Grid item xs={12} md={4} lg={6}>
                Gauges
              </Grid>
              <Grid item xs={12} md={4} lg={3}>
                <Box
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                >
                  <Typography variant="h2">Top Processes</Typography>
                  <Link to={`${url}/processes`} className={classes.detailsLink}>
                    View Details
                  </Link>
                </Box>
                {/* @todo: Replace with real component. */}
                {topProcessesLoading && <div>Loading...</div>}
                {(lastUpdatedError || topProcessesError) && <div>Error!</div>}
                {Object.keys(topProcessesData.Processes).length > 0 && (
                  <pre>
                    {JSON.stringify(props.topProcessesData.Processes, null, 2)}
                  </pre>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid
          container
          alignItems="flex-end"
          justify="space-between"
          item
          xs={12}
          spacing={0}
        >
          <Grid item>
            <Typography variant="h2">Resource Allocation History</Typography>
          </Grid>
          <Grid item>
            {/* TODO make this functional
              <Select
                options={rangeSelectOptions}
                defaultValue={rangeSelectOptions[0]}
                onChange={handleChartRangeChange}
                name="chartRange"
                id="chartRange"
                small
                label="Select Time Range"
                hideLabel
                isClearable={false}
                data-qa-item="chartRange"
              />
              */}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paperSection}>Graphs here</Paper>
        </Grid>
        <Grid container justify="space-between" item spacing={0}>
          <ListeningServices />
          <ActiveConnections />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default React.memo(LongviewDetailOverview);
