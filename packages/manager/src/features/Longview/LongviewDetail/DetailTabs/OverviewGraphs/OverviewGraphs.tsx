import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
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
  timezone: string;
  lastUpdated?: number;
  lastUpdatedError: boolean;
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
      <Grid item className={classes.headerOuter}>
        <Grid item>
          <Typography variant="h2" className={classes.spacing}>
            Resource Allocation History
          </Typography>
        </Grid>
        <Grid item className={classes.spacing}>
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
            justifyContent="space-between"
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
