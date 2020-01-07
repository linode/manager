import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import get from 'src/features/Longview/request';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { LongviewApplications, WithStartAndEnd } from '../../../request.types';
import TimeRangeSelect from '../../../shared/TimeRangeSelect';
import ApacheGraphs from './ApacheGraphs';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: 250
  }
}));

interface Props {
  clientAPIKey?: string;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

export const Apache: React.FC<Props> = props => {
  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;
  const classes = useStyles();

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    start: 0,
    end: 0
  });

  const apache = useAPIRequest<
    LongviewApplications['Applications'] | undefined
  >(
    clientAPIKey && lastUpdated
      ? () =>
          get(clientAPIKey, 'getValues', { fields: ['apache'] }).then(
            response => response.DATA?.Applications
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
      id="tabpanel-apache"
      role="tabpanel"
      aria-labelledby="tab-apache"
      direction="column"
    >
      <DocumentTitleSegment segment={'Apache'} />
      <Grid item xs={12}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
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
      <Grid item xs={12} className="py0">
        <ApacheGraphs
          data={apache.data?.Apache}
          isToday={isToday}
          loading={apache.loading}
          error={lastUpdatedError || apache.error}
          timezone={timezone}
        />
      </Grid>
    </Grid>
  );
};

export default Apache;
