import { DataSeries, ManagedStatsData } from 'linode-js-sdk/lib/managed';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import LineGraph from 'src/components/LineGraph';
import TabbedPanel from 'src/components/TabbedPanel';
import useTimezone from 'src/utilities/useTimezone';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
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
    }
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
  caption: {
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing()
  }
}));

interface Props {
  data: ManagedStatsData | null;
  loading: boolean;
  error?: string;
}

const chartHeight = 300;

const formatData = (value: DataSeries[]): [number, number][] =>
  value.map(thisPoint => [thisPoint.x, thisPoint.y]);

const createTabs = (
  data: ManagedStatsData | null,
  timezone: string,
  classes: Record<string, string>
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
            <div>
              <LineGraph
                timezone={timezone}
                unit="%"
                chartHeight={chartHeight}
                showToday={true}
                data={[
                  {
                    borderColor: 'rgba(54, 131, 220, 1)',
                    backgroundColor: 'rgba(54, 131, 220, .5)',
                    data: formatData(data.cpu),
                    label: 'CPU %'
                  }
                ]}
              />
            </div>
          </div>
        );
      },
      title: 'CPU Usage'
    },
    {
      render: () => {
        return (
          <div className={classes.root}>
            <div>{summaryCopy}</div>
            <div>
              <LineGraph
                timezone={timezone}
                unit={'bps'}
                chartHeight={chartHeight}
                showToday={true}
                data={[
                  {
                    borderColor: 'rgba(54, 131, 220, 1)',
                    backgroundColor: 'rgba(54, 131, 220, .5)',
                    data: formatData(data.net_in),
                    label: 'Network Traffic In'
                  },
                  {
                    borderColor: 'rgba(1, 177, 89, 1)',
                    backgroundColor: 'rgba(1, 177, 89, .5)',
                    data: formatData(data.net_out),
                    label: 'Network Traffic Out'
                  }
                ]}
              />
            </div>
          </div>
        );
      },
      title: 'Network Transfer'
    },
    {
      render: () => {
        return (
          <div className={classes.root}>
            <div>{summaryCopy}</div>
            <div>
              <LineGraph
                timezone={timezone}
                chartHeight={chartHeight}
                showToday={true}
                unit={` op/s`}
                data={[
                  {
                    borderColor: 'rgba(54, 131, 220, 1)',
                    backgroundColor: 'rgba(54, 131, 220, .5)',
                    data: formatData(data.disk),
                    label: 'Disk I/O'
                  }
                ]}
              />
            </div>
          </div>
        );
      },
      title: 'Disk I/O'
    }
  ];
};

export const ManagedChartPanel: React.FC<Props> = props => {
  const { data, error, loading } = props;
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

  const tabs = createTabs(data, timezone, classes);

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

export default React.memo(ManagedChartPanel);
