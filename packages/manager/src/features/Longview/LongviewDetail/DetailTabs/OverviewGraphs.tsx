import * as React from 'react';

import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { AllData, getValues, WithStartAndEnd } from '../../request';
import TimeRangeSelect from '../../shared/TimeRangeSelect';
import { useClientLastUpdated } from '../../shared/useClientLastUpdated';

const useStyles = makeStyles((theme: Theme) => ({
  paperSection: {
    padding: theme.spacing(3) + 1,
    marginBottom: theme.spacing(1) + 3
  }
}));

interface Props {
  clientAPIKey: string;
}
export type CombinedProps = Props;

export const OverviewGraphs: React.FC<Props> = props => {
  const { clientAPIKey } = props;
  const classes = useStyles();
  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    start: 0,
    end: 0
  });
  const [data, setData] = React.useState<Partial<AllData>>({});
  const request = (start: number = time.start, end: number = time.end) =>
    getValues(clientAPIKey, {
      fields: ['cpu', 'memory', 'network', 'disk'],
      start,
      end
    }).then(response => setData(response));

  const { lastUpdated } = useClientLastUpdated(
    clientAPIKey,
    clientAPIKey ? request : undefined
  );

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ start, end });
    request(start, end);
  };

  console.log(data);
  console.table({ start: time.start, end: time.end });

  return (
    <Grid container alignItems="flex-end" item xs={12} spacing={0}>
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
            defaultValue={'Past 30 Minutes'}
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
            <Grid item xs={6}>
              <LongviewLineGraph
                title="CPU"
                subtitle="%"
                showToday={false}
                timezone="GMT"
                data={[]}
              />
            </Grid>
            <Grid item xs={6}>
              <LongviewLineGraph
                title="RAM"
                subtitle="GB"
                showToday={false}
                timezone="GMT"
                data={[]}
              />
            </Grid>
            <Grid item xs={6}>
              <LongviewLineGraph
                title="Network"
                subtitle="KB/s"
                showToday={false}
                timezone="GMT"
                data={[]}
              />
            </Grid>
            <Grid item xs={6}>
              <LongviewLineGraph
                title="Disk I/O"
                subtitle="ops/s"
                showToday={false}
                timezone="GMT"
                data={[]}
              />
            </Grid>
            <Grid item xs={6}>
              <LongviewLineGraph
                title="Load"
                subtitle="Target < 1.00"
                showToday={false}
                timezone="GMT"
                data={[]}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default OverviewGraphs;
