import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Grid } from 'src/components/Grid';
import { Typography } from 'src/components/Typography';
import { Paper } from 'src/components/Paper';
import { isToday as _isToday } from 'src/utilities/isToday';

import { WithStartAndEnd } from '../../../request.types';
import TimeRangeSelect from '../../../shared/TimeRangeSelect';
import CPUGraph from './CPUGraph';
import DiskGraph from './DiskGraph';
import LoadGraph from './LoadGraph';
import MemoryGraph from './MemoryGraph';
import NetworkGraph from './NetworkGraph';
import { GraphProps } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  headerOuter: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.25),
  },
  paperSection: {
    marginBottom: `calc(${theme.spacing(1)} + 3px)`,
    padding: `calc(${theme.spacing(3)} + 1px)`,
  },
  selectTimeRange: {
    width: 150,
  },
  spacing: {
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
}));

interface Props {
  clientAPIKey: string;
  lastUpdated?: number;
  lastUpdatedError: boolean;
  timezone: string;
}
export type CombinedProps = Props;

export const OverviewGraphs: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ end, start });
  };

  const isToday = _isToday(time.start, time.end);

  const graphProps: GraphProps = {
    clientAPIKey,
    end: time.end,
    isToday,
    lastUpdated,
    lastUpdatedError,
    start: time.start,
    timezone,
  };

  return (
    <Grid item>
      <Grid className={classes.headerOuter} item>
        <Grid item>
          <Typography className={classes.spacing} variant="h2">
            Resource Allocation History
          </Typography>
        </Grid>
        <Grid className={classes.spacing} item>
          <TimeRangeSelect
            className={classes.selectTimeRange}
            defaultValue={'Past 30 Minutes'}
            handleStatsChange={handleStatsChange}
            hideLabel
            label="Select Time Range"
          />
        </Grid>
      </Grid>
      <Grid item />
      <Grid item xs={12}>
        <Paper className={classes.paperSection}>
          <Grid
            alignItems="center"
            container
            direction="row"
            justifyContent="space-between"
            spacing={4}
          >
            <Grid item sm={6} xs={12}>
              <CPUGraph {...graphProps} />
            </Grid>
            <Grid item sm={6} xs={12}>
              <MemoryGraph {...graphProps} />
            </Grid>
            <Grid item sm={6} xs={12}>
              <NetworkGraph {...graphProps} />
            </Grid>
            <Grid item sm={6} xs={12}>
              <DiskGraph {...graphProps} />
            </Grid>
            <Grid item sm={6} xs={12}>
              <LoadGraph {...graphProps} />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default OverviewGraphs;
