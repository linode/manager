import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Grid } from 'src/components/Grid';
import { isToday as _isToday } from 'src/utilities/isToday';

import {
  LongviewNetworkInterface,
  WithStartAndEnd,
} from '../../../request.types';
import TimeRangeSelect from '../../../shared/TimeRangeSelect';
import { useGraphs } from '../OverviewGraphs/useGraphs';
import { NetworkGraphs } from './NetworkGraphs';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    [theme.breakpoints.down('lg')]: {
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

export const NetworkLanding = (props: Props) => {
  const { classes } = useStyles();

  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const { data, error, loading, request } = useGraphs(
    ['network'],
    clientAPIKey,
    time.start,
    time.end
  );

  React.useEffect(() => {
    request();
  }, [clientAPIKey, lastUpdated, lastUpdatedError, time]);

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ end, start });
  };

  const interfaces: LongviewNetworkInterface = data?.Network?.Interface ?? {};

  const isToday = _isToday(time.start, time.end);

  return (
    <Grid container direction="column">
      <DocumentTitleSegment segment={'Network'} />
      <Grid item xs={12}>
        <Box
          alignItems="center"
          className={classes.root}
          display="flex"
          flexDirection="row"
          justifyContent="flex-end"
        >
          <TimeRangeSelect
            className={classes.select}
            defaultValue="Past 30 Minutes"
            handleStatsChange={handleStatsChange}
            hideLabel
            label="Select Time Range"
            small
          />
        </Box>
      </Grid>
      <Grid className="py0" item xs={12}>
        <NetworkGraphs
          end={time.end}
          error={lastUpdatedError?.[0]?.reason || error}
          isToday={isToday}
          loading={loading}
          networkData={interfaces}
          start={time.start}
          timezone={timezone}
        />
      </Grid>
    </Grid>
  );
};
