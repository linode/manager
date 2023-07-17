import { DataSeries, ManagedStatsData } from '@linode/api-v4/lib/managed';
import { Theme } from '@mui/material/styles';
import { WithTheme, makeStyles, withTheme } from '@mui/styles';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LineGraph } from 'src/components/LineGraph/LineGraph';
import { TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import { Typography } from 'src/components/Typography';
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
  canvasContainer: {
    marginTop: theme.spacing(3),
  },
  caption: {},
  chartSelect: {
    maxWidth: 150,
    [theme.breakpoints.down('lg')]: {
      marginBottom: theme.spacing(3),
      marginLeft: theme.spacing(3),
    },
    [theme.breakpoints.up('lg')]: {
      position: 'absolute !important' as 'absolute',
      right: 24,
      top: 0,
      zIndex: 2,
    },
  },
  chartSelectCompact: {
    [theme.breakpoints.up('lg')]: {
      right: 12,
      top: -6,
    },
  },
  graphControls: {
    /**
     * hacky solution to solve for a bug where
     * the canvas element under the chart kept ending up with a 0px height
     * so that it was not appearing
     */
    '& canvas': {
      height: `300px !important`,
    },
    '&:before': {
      backgroundColor: theme.palette.divider,
      content: '""',
      height: 'calc(100% - 102px);',
      left: 0,
      position: 'absolute',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
      top: 52,
      width: 1,
    },
    position: 'relative',
  },
  inner: {
    paddingTop: 0,
  },
  root: {
    position: 'relative',
  },
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
    <Typography className={classes.caption} variant="body1">
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
                data={[
                  {
                    backgroundColor: theme.graphs.cpu.percent,
                    borderColor: 'transparent',
                    data: formatData(data.cpu),
                    label: 'CPU %',
                  },
                ]}
                accessibleDataTable={{ unit: '%' }}
                ariaLabel="CPU Usage Graph"
                chartHeight={chartHeight}
                showToday={true}
                timezone={timezone}
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
                data={[
                  {
                    backgroundColor: theme.graphs.network.inbound,
                    borderColor: 'transparent',
                    data: formatData(data.net_in),
                    label: 'Network Traffic In',
                  },
                  {
                    backgroundColor: theme.graphs.network.outbound,
                    borderColor: 'transparent',
                    data: formatData(data.net_out),
                    label: 'Network Traffic Out',
                  },
                ]}
                accessibleDataTable={{ unit: 'Kb/s"' }}
                ariaLabel="Network Transfer Graph"
                chartHeight={chartHeight}
                formatData={convertNetworkData}
                formatTooltip={_formatTooltip}
                nativeLegend
                showToday={true}
                timezone={timezone}
                unit="/s"
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
                data={[
                  {
                    backgroundColor: theme.graphs.yellow,
                    borderColor: 'transparent',
                    data: formatData(data.disk),
                    label: 'Disk I/O',
                  },
                ]}
                accessibleDataTable={{ unit: 'op/s' }}
                ariaLabel="Disk I/O Graph"
                chartHeight={chartHeight}
                showToday={true}
                timezone={timezone}
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
  const timezone = getUserTimezone(profile?.timezone);
  const { data, error, isLoading } = useManagedStatsQuery();

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
        copy={''}
        error={undefined} // Use custom error handling (above)
        header={''}
        initTab={initialTab}
        innerClass={classes.inner}
        rootClass={`tabbedPanel`}
        tabs={tabs}
      />
    </div>
  );
};

export default withTheme(ManagedChartPanel);
