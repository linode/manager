import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
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
  paperSection: {
    padding: theme.spacing(3) + 1,
    marginBottom: theme.spacing(1) + 3
  },
  selectTimeRange: {
    width: 150
  },
  headerOuter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1) + 2
  }
}));

interface Props {
  clientAPIKey: string;
  timezone: string;
  lastUpdated?: number;
  lastUpdatedError: boolean;
}
export type CombinedProps = Props;

export const OverviewGraphs: React.FC<CombinedProps> = props => {
  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;
  const classes = useStyles();
  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    start: 0,
    end: 0
  });

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ start, end });
  };

  const isToday = _isToday(time.end, time.start);

  const graphProps: GraphProps = {
    clientAPIKey,
    timezone,
    isToday,
    start: time.start,
    end: time.end,
    lastUpdatedError,
    lastUpdated
  };

  return (
    <Grid item>
      <Grid item className={classes.headerOuter}>
        <Grid item>
          <Typography variant="h2">Resource Allocation History</Typography>
        </Grid>
        <Grid item>
          <TimeRangeSelect
            handleStatsChange={handleStatsChange}
            defaultValue={'Past 30 Minutes'}
            label="Select Time Range"
            className={classes.selectTimeRange}
            hideLabel
          />
        </Grid>
      </Grid>
      <Grid item />
      <Grid item xs={12}>
        <Paper className={classes.paperSection}>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
            spacing={4}
          >
            <Grid item xs={12} sm={6}>
              <CPUGraph {...graphProps} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MemoryGraph {...graphProps} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NetworkGraph {...graphProps} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DiskGraph {...graphProps} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LoadGraph {...graphProps} />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default OverviewGraphs;
