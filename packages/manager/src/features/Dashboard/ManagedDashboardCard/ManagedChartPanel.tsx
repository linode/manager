import { DataSeries, ManagedStatsData } from 'linode-js-sdk/lib/managed';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import {
  makeStyles,
  Theme,
  WithTheme,
  withTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import LineGraph from 'src/components/LineGraph';
import SimpleLegend from 'src/components/LineGraph/SimpleLegend';
import TabbedPanel from 'src/components/TabbedPanel';
import useTimezone from 'src/utilities/useTimezone';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative'
  },
  inner: {
    paddingTop: 0
  },
  graphControls: {
    position: 'relative',
    '&:before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 52,
      height: 'calc(100% - 102px);',
      width: 1,
      backgroundColor: theme.palette.divider,
      [theme.breakpoints.down('xs')]: {
        display: 'none'
      }
    },
    /**
     * hacky solution to solve for a bug where
     * the canvas element under the chart kept ending up with a 0px height
     * so that it was not appearing
     */
    '& canvas': {
      height: `300px !important`
    }
  },
  canvasContainer: {
    marginTop: theme.spacing(3)
  },
  chartSelect: {
    maxWidth: 150,
    [theme.breakpoints.up('lg')]: {
      position: 'absolute !important' as 'absolute',
      right: 24,
      top: 0,
      zIndex: 2
    },
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(3),
      marginBottom: theme.spacing(3)
    }
  },
  chartSelectCompact: {
    [theme.breakpoints.up('lg')]: {
      right: 12,
      top: -6
    }
  },
  caption: {}
}));

interface Props {
  data: ManagedStatsData | null;
  loading: boolean;
  error?: string;
}

type CombinedProps = Props & WithTheme;

const chartHeight = 300;

const formatData = (value: DataSeries[]): [number, number][] =>
  value.map(thisPoint => [thisPoint.x, thisPoint.y]);

const createTabs = (
  data: ManagedStatsData | null,
  timezone: string,
  classes: Record<string, string>,
  theme: Theme
) => {
  const summaryCopy = (
    <Typography variant="body1" className={classes.caption}>
      This graph represents combined usage for all Linodes on this account.
    </Typography>
  );
  if (!data) {
    return [];
  }
  return [
    {
      render: () => {
        return (
          <div className={classes.root}>
            <div>{summaryCopy}</div>
            <div className={classes.canvasContainer}>
              <LineGraph
                timezone={timezone}
                chartHeight={chartHeight}
                showToday={true}
                data={[
                  {
                    borderColor: theme.graphs.blueBorder,
                    backgroundColor: theme.graphs.blue,
                    data: formatData(data.cpu),
                    label: 'CPU %'
                  }
                ]}
              />
            </div>
          </div>
        );
      },
      title: 'CPU Usage (%)',
      name: 'cpu-usage'
    },
    {
      render: () => {
        return (
          <div className={classes.root}>
            <div>{summaryCopy}</div>
            <SimpleLegend
              rows={[
                { legendTitle: 'Network Traffic In', legendColor: 'blue' },
                { legendTitle: 'Network Traffic Out', legendColor: 'green' }
              ]}
            />
            <div className={classes.canvasContainer}>
              <LineGraph
                timezone={timezone}
                chartHeight={chartHeight}
                showToday={true}
                data={[
                  {
                    borderColor: theme.graphs.blueBorder,
                    backgroundColor: theme.graphs.blue,
                    data: formatData(data.net_in),
                    label: 'Network Traffic In'
                  },
                  {
                    borderColor: theme.graphs.greenBorder,
                    backgroundColor: theme.graphs.green,
                    data: formatData(data.net_out),
                    label: 'Network Traffic Out'
                  }
                ]}
              />
            </div>
          </div>
        );
      },
      title: 'Network Transfer (bits/s)',
      name: 'network-transfer'
    },
    {
      render: () => {
        return (
          <div className={classes.root}>
            <div>{summaryCopy}</div>
            <div className={classes.canvasContainer}>
              <LineGraph
                timezone={timezone}
                chartHeight={chartHeight}
                showToday={true}
                data={[
                  {
                    borderColor: theme.graphs.yellowBorder,
                    backgroundColor: theme.graphs.yellow,
                    data: formatData(data.disk),
                    label: 'Disk I/O'
                  }
                ]}
              />
            </div>
          </div>
        );
      },
      title: 'Disk I/O (op/s)',
      name: 'disk-io'
    }
  ];
};

export const ManagedChartPanel: React.FC<CombinedProps> = props => {
  const { data, error, loading, theme } = props;
  const classes = useStyles();
  const timezone = useTimezone();

  if (error) {
    return <ErrorState errorText={error} />;
  }

  if (loading) {
    return <CircleProgress />;
  }

  if (data === null) {
    return null;
  }

  const tabs = createTabs(data, timezone, classes, theme);

  const initialTab = 0;

  return (
    <React.Fragment>
      <div className={classes.graphControls}>
        <TabbedPanel
          rootClass={`tabbedPanel`}
          innerClass={classes.inner}
          error={undefined} // Use custom error handling (above)
          header={''}
          copy={''}
          tabs={tabs}
          initTab={initialTab}
        />
      </div>
    </React.Fragment>
  );
};

export default React.memo(withTheme(ManagedChartPanel));
