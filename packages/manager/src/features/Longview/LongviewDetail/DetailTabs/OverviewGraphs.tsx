import { pathOr } from 'ramda';
import * as React from 'react';

import Paper from 'src/components/core/Paper';
import {
  makeStyles,
  Theme,
  WithTheme,
  withTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { AllData, getValues, WithStartAndEnd } from '../../request';
import { Stat } from '../../request.types';
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
export type CombinedProps = Props & WithTheme;

export const OverviewGraphs: React.FC<CombinedProps> = props => {
  const { clientAPIKey, theme } = props;

  const classes = useStyles();
  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    start: 0,
    end: 0
  });
  const [data, setData] = React.useState<Partial<AllData>>({});
  const request = (start: number = time.start, end: number = time.end) => {
    // Don't start requesting until we have a time range.
    if (start === 0 || end === 0) {
      return;
    }
    getValues(clientAPIKey, {
      fields: ['cpu', 'memory', 'network', 'disk', 'load'],
      start,
      end
    }).then(response => setData(response));
  };

  useClientLastUpdated(clientAPIKey, request);

  const _convertData = React.useCallback(convertData, [data, time.start]);

  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ start, end });
    request(start, end);
  };

  const isToday = time.end - time.start < 60 * 60 * 25;

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
                title="Memory"
                subtitle="GB"
                showToday={isToday}
                timezone="GMT"
                data={[
                  {
                    label: 'Used',
                    borderColor: theme.graphs.greenBorder,
                    backgroundColor: theme.graphs.green,
                    data: _convertData(
                      time.start,
                      pathOr([], ['Memory', 'real', 'used'], data)
                    )
                  },
                  {
                    label: 'Cache',
                    borderColor: theme.graphs.orangeBorder,
                    backgroundColor: theme.graphs.orange,
                    data: _convertData(
                      time.start,
                      pathOr([], ['Memory', 'real', 'cache'], data)
                    )
                  },
                  {
                    label: 'Buffers',
                    borderColor: theme.graphs.purpleBorder,
                    backgroundColor: theme.graphs.purple,
                    data: _convertData(
                      time.start,
                      pathOr([], ['Memory', 'real', 'buffers'], data)
                    )
                  },
                  {
                    label: 'Swap',
                    borderColor: theme.graphs.blueBorder,
                    backgroundColor: theme.graphs.blue,
                    data: _convertData(
                      time.start,
                      pathOr([], ['Memory', 'swap', 'used'], data)
                    )
                  }
                ]}
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
                showToday={isToday}
                timezone="GMT"
                data={[
                  {
                    label: 'Load',
                    borderColor: theme.graphs.blueBorder,
                    backgroundColor: theme.graphs.blue,
                    data: _convertData(time.start, data.Load || [])
                  }
                ]}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};
export const convertData = (start: number, d: Stat[]) => {
  const points = d.map(
    thisPoint => [thisPoint.x * 1000, thisPoint.y] as [number, number | null]
  );

  if (points.length < 1) {
    // Empty array
    return points;
  }

  /**
   * The LV API does not provide proper time series data;
   * only times for which the agent was collecting data
   * have entries in the response (so if your Linode is 3 days
   * old and you ask for graphs for the past year, the response
   * will only have 3 days of data). We therefore need to pad the
   * front of the response with an extra data point to force the x
   * axis of each graph to show the requested time span.
   * Using null as the y value makes the intervening section of the
   * graph blank, which is the behavior we need.
   *
   * NOTE: The calculation below is using 5 minutes as the increment,
   * since this seems to be the normal behavior, even when using
   * an account with a Longview Pro subscription. If this
   * check isn't done, we can end up with a gap at the
   * front of the graph.
   *
   * This interval may not work in
   * all cases, since data resolution is supposed to be 1/minute for Pro.
   * We may have to adjust for this here, though on my test account this
   * causes a break in the graph.
   */
  if (points[0][0] - start * 1000 > 60 * 5000) {
    points.unshift([start * 1000, null]);
  }

  return points;
};

export default withTheme(OverviewGraphs);
