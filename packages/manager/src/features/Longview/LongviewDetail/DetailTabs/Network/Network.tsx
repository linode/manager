import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { isToday as _isToday } from 'src/utilities/isToday';
import {
  LongviewNetworkInterface,
  WithStartAndEnd,
} from '../../../request.types';
import TimeRangeSelect from '../../../shared/TimeRangeSelect';
import { useGraphs } from '../OverviewGraphs/useGraphs';
import NetworkGraphs from './NetworkGraphs';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
  },
  select: {
    width: 250,
  },
}));

interface Props {
  clientAPIKey: string;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

export const NetworkLanding: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    start: 0,
    end: 0,
  });

  const { data, loading, error, request } = useGraphs(
    ['network'],
    clientAPIKey,
    time.start,
    time.end
  );

  React.useEffect(() => {
    request();
  }, [clientAPIKey, lastUpdated, lastUpdatedError, time]);

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ start, end });
  };

  const interfaces: LongviewNetworkInterface = data?.Network?.Interface ?? {};

  const isToday = _isToday(time.start, time.end);

  return (
    <Grid container direction="column">
      <DocumentTitleSegment segment={'Network'} />
      <Grid item xs={12}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-end"
          alignItems="center"
          className={classes.root}
        >
          <TimeRangeSelect
            small
            className={classes.select}
            handleStatsChange={handleStatsChange}
            defaultValue="Past 30 Minutes"
            label="Select Time Range"
            hideLabel
          />
        </Box>
      </Grid>
      <Grid item xs={12} className="py0">
        <NetworkGraphs
          networkData={interfaces}
          isToday={isToday}
          loading={loading}
          error={lastUpdatedError?.[0]?.reason || error}
          timezone={timezone}
          start={time.start}
          end={time.end}
        />
      </Grid>
    </Grid>
  );
};

export default NetworkLanding;
