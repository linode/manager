import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { AllData, getValues, WithStartAndEnd } from '../../../request';
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
  }
}));

interface Props {
  clientAPIKey: string;
  timezone: string;
  lastUpdated?: number;
  lastUpdatedError: boolean;
}

export type CombinedProps = Props & WithSnackbarProps;

export const OverviewGraphs: React.FC<CombinedProps> = props => {
  const { clientAPIKey, timezone, lastUpdated } = props;
  const classes = useStyles();
  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    start: 0,
    end: 0
  });
  const [data, setData] = React.useState<Partial<AllData> | undefined>();
  const [fetchError, setError] = React.useState<string>('');

  const request = (_start: number, _end: number, cb?: Function) => {
    if (_start && _end) {
      return getValues(clientAPIKey, {
        fields: ['cpu', 'disk', 'load', 'memory', 'network', 'sysinfo'],
        start: _start,
        end: _end
      })
        .then(response => {
          setData(response);
          if (cb) {
            cb();
          }
        })
        .catch(e => {
          if (!data) {
            setError('There was an error retrieving stats.');
          }
          return Promise.reject(e);
        });
    }

    return Promise.resolve({});
  };

  const handleStatsChange = (start: number, end: number) => {
    return request(start, end, () => {
      setTimeBox({ start, end });
    });
  };

  const handleError = () => {
    props.enqueueSnackbar('There was an error retrieving stats.', {
      variant: 'error'
    });
  };

  React.useEffect(() => {
    request(time.start, time.end);
  }, [lastUpdated]);

  const isToday = time.end - time.start < 60 * 60 * 25;

  const graphProps: GraphProps = {
    timezone,
    isToday,
    start: time.start,
    end: time.end,
    data: data || {},
    error: fetchError
  };

  return (
    <Grid container item spacing={0}>
      <Grid
        container
        item
        direction="row"
        justify="space-between"
        alignItems="center"
        spacing={0}
        className="py0"
      >
        <Grid item>
          <Typography variant="h2">Resource Allocation History</Typography>
        </Grid>
        <Grid item>
          <TimeRangeSelect
            handleStatsChange={handleStatsChange}
            handleFetchError={handleError}
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

export default withSnackbar(OverviewGraphs);
