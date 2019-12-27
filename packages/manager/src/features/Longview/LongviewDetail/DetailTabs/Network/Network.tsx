import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import get from 'src/features/Longview/request';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import {
  LongviewNetworkInterface,
  WithStartAndEnd
} from '../../../request.types';
import TimeRangeSelect from '../../../shared/TimeRangeSelect';
import NetworkGraphs from './NetworkGraphs';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: 250,
    marginBottom: theme.spacing()
  }
}));

interface Props {
  clientAPIKey?: string;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

export const NetworkLanding: React.FC<Props> = props => {
  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;
  const classes = useStyles();

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    start: 0,
    end: 0
  });

  const network = useAPIRequest<LongviewNetworkInterface | undefined>(
    clientAPIKey && lastUpdated
      ? () =>
          get(clientAPIKey, 'getValues', { fields: ['processes'] }).then(
            response => response.DATA?.Network?.Interface
          )
      : null,
    {},
    [clientAPIKey, lastUpdated]
  );

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ start, end });
  };

  const isToday = time.end - time.start < 60 * 60 * 25;

  return (
    <Grid
      container
      id="tabpanel-processes"
      role="tabpanel"
      aria-labelledby="tab-processes"
      direction="column"
    >
      <DocumentTitleSegment segment={'Network'} />
      <Grid item xs={12}>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Typography variant="h2">Resource Allocation History</Typography>
          <TimeRangeSelect
            small
            className={classes.root}
            handleStatsChange={handleStatsChange}
            defaultValue="Past 30 Minutes"
            label="Select Time Range"
            hideLabel
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <NetworkGraphs
          networkData={network.data || {}}
          isToday={isToday}
          loading={network.loading}
          error={lastUpdatedError || network.error}
          timezone={timezone}
        />
      </Grid>
    </Grid>
  );
};

export default NetworkLanding;
