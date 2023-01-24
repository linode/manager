import { DataSeries, ManagedStatsData } from '@linode/api-v4/lib/managed';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import {
  makeStyles,
  Theme,
  WithTheme,
  withTheme,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import LineGraph from 'src/components/LineGraph';
import TabbedPanel from 'src/components/TabbedPanel';
import {
  convertNetworkToUnit,
  formatNetworkTooltip,
  generateNetworkUnits,
} from 'src/features/Longview/shared/utilities';
import { useManagedStatsQuery } from 'src/queries/managed/managed';
import { useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getUserTimezone from 'src/utilities/getUserTimezone';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
  },
  inner: {
    paddingTop: 0,
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
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    /**
     * hacky solution to solve for a bug where
     * the canvas element under the chart kept ending up with a 0px height
     * so that it was not appearing
     */
    '& canvas': {
      height: `300px !important`,
    },
  },
  canvasContainer: {
    marginTop: theme.spacing(3),
  },
  chartSelect: {
    maxWidth: 150,
    [theme.breakpoints.up('lg')]: {
      position: 'absolute !important' as 'absolute',
      right: 24,
      top: 0,
      zIndex: 2,
    },
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
  },
  chartSelectCompact: {
    [theme.breakpoints.up('lg')]: {
      right: 12,
      top: -6,
    },
  },
  caption: {},
}));

type CombinedProps = WithTheme;

const chartHeight = 300;

const formatData = (value: DataSeries[]): [number, number][] =>
  value.map((thisPoint) => [thisPoint.x, thisPoint.y]);

const _formatTooltip = (valueInBytes: number) =>
  formatNetworkTooltip(valueInBytes / 8);

const createTabs = (
  data: ManagedStatsData | undefined,
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

  const formattedNetIn = data.net_in.map((dataPoint) => dataPoint.y);
  const formattedNetOut = data.net_out.map((dataPoint) => dataPoint.y);
  const netInMax = Math.max(...formattedNetIn);
  const netOutMax = Math.max(...formattedNetOut);

  // Find the max and convert to bytes, which is what generateNetworkUnits
  // expects.
  const maxNetworkInBytes = Math.max(netInMax, netOutMax) / 8;
  const unit = generateNetworkUnits(maxNetworkInBytes);

  const convertNetworkData = (value: number) => {
    return convertNetworkToUnit(value, unit as any);
  };

  return [
    {
      render: () => {
        return (
          <div className={classes.root}>
            <div>{summaryCopy}</div>
            <div className={classes.canvasContainer}>
              <LineGraph
                ariaLabel="CPU Usage Graph"
                timezone={timezone}
                chartHeight={chartHeight}
                showToday={true}
                data={[
                  {
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.cpu.percent,
                    data: formatData(data.cpu),
                    label: 'CPU %',
                  },
                ]}
              />
            </div>
          </div>
        );
      },
      title: 'CPU Usage (%)',
    },
    {
      render: () => {
        return (
          <div className={classes.root}>
            <div>{summaryCopy}</div>
            <div className={classes.canvasContainer}>
              <LineGraph
                ariaLabel="Network Transfer Graph"
                timezone={timezone}
                chartHeight={chartHeight}
                showToday={true}
                nativeLegend
                unit="/s"
                formatData={convertNetworkData}
                formatTooltip={_formatTooltip}
                data={[
                  {
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.network.inbound,
                    data: formatData(data.net_in),
                    label: 'Network Traffic In',
                  },
                  {
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.network.outbound,
                    data: formatData(data.net_out),
                    label: 'Network Traffic Out',
                  },
                ]}
              />
            </div>
          </div>
        );
      },
      title: `Network Transfer (${unit}/s)`,
    },
    {
      render: () => {
        return (
          <div className={classes.root}>
            <div>{summaryCopy}</div>
            <div className={classes.canvasContainer}>
              <LineGraph
                ariaLabel="Disk I/O Graph"
                timezone={timezone}
                chartHeight={chartHeight}
                showToday={true}
                data={[
                  {
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.yellow,
                    data: formatData(data.disk),
                    label: 'Disk I/O',
                  },
                ]}
              />
            </div>
          </div>
        );
      },
      title: 'Disk I/O (op/s)',
    },
  ];
};

export const ManagedChartPanel: React.FC<CombinedProps> = (props) => {
  const { theme } = props;
  const classes = useStyles();
  const { data: profile } = useProfile();
  const timezone = getUserTimezone(profile);
  const { data, isLoading, error } = useManagedStatsQuery();

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(
            error,
            'Unable to load your usage statistics.'
          )[0].reason
        }
      />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!data) {
    return null;
  }

  const tabs = createTabs(data.data, timezone, classes, theme);

  const initialTab = 0;

  return (
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
  );
};

export default withTheme(ManagedChartPanel);
