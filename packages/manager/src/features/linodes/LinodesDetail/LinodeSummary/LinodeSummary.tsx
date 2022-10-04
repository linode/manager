import { DateTime } from 'luxon';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import PendingIcon from 'src/assets/icons/pending.svg';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LineGraph from 'src/components/LineGraph';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import {
  STATS_NOT_READY_API_MESSAGE,
  STATS_NOT_READY_MESSAGE,
  useLinodeStats,
  useLinodeStatsByDate,
} from 'src/queries/linodes';
import { useProfile } from 'src/queries/profile';
import { setUpCharts } from 'src/utilities/charts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  formatNumber,
  formatPercentage,
  getMetrics,
} from 'src/utilities/statMetrics';
import { debounce } from 'throttle-debounce';
import { getDateOptions } from './helpers';
import NetworkGraph, { ChartProps } from './NetworkGraphs';
import { StatsPanel } from './StatsPanel';

setUpCharts();

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    chartSelect: {
      maxWidth: 150,
    },
    graphControls: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: theme.spacing(),
    },
    graphGrids: {
      flexWrap: 'nowrap',
      margin: 0,
      [theme.breakpoints.down(1100)]: {
        flexWrap: 'wrap',
      },
    },
    grid: {
      backgroundColor: theme.bg.offWhite,
      border: `solid 1px ${theme.borderColors.divider}`,
      marginBottom: theme.spacing(2),
      '&.MuiGrid-item': {
        padding: theme.spacing(2),
      },
      '& h2': {
        fontSize: '1rem',
      },
      [theme.breakpoints.up(1100)]: {
        '&:first-of-type': {
          marginRight: theme.spacing(2),
        },
      },
    },
    labelRangeSelect: {
      fontSize: '1rem',
      paddingRight: theme.spacing(2),
    },
    emptyText: {
      textAlign: 'center',
      marginTop: theme.spacing(),
    },
  })
);

interface Props {
  isBareMetalInstance: boolean;
  linodeCreated: string;
}

const chartHeight = 160;

const LinodeSummary: React.FC<Props> = (props) => {
  const { linodeCreated, isBareMetalInstance } = props;
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);
  const theme = useTheme<Theme>();
  const classes = useStyles();

  const { data: profile } = useProfile();
  const timezone = profile?.timezone || DateTime.local().zoneName;

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const options = getDateOptions(linodeCreated);
  const [rangeSelection, setRangeSelection] = React.useState('24');
  const [year, month] = rangeSelection.split(' ');

  const isLast24Hours = rangeSelection === '24';

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchLinodeStats,
  } = useLinodeStats(id, isLast24Hours, linodeCreated);

  const {
    data: statsByDateData,
    isLoading: statsByDateLoading,
    error: statsByDateError,
  } = useLinodeStatsByDate(id, year, month, !isLast24Hours, linodeCreated);

  const stats = isLast24Hours ? statsData : statsByDateData;
  const isLoading = isLast24Hours ? statsLoading : statsByDateLoading;
  const error = isLast24Hours ? statsError : statsByDateError;

  const statsErrorString = error
    ? getAPIErrorOrDefault(error, 'An error occurred while getting stats.')[0]
        .reason
    : undefined;

  const areStatsNotReady =
    statsErrorString &&
    [STATS_NOT_READY_API_MESSAGE, STATS_NOT_READY_MESSAGE].includes(
      statsErrorString
    );

  const handleChartRangeChange = (e: Item<string>) => {
    setRangeSelection(e.value);
  };

  /*
    We create a debounced function to refetch Linode stats that will run 1.5 seconds after the window is resized.
    This makes the graphs adjust sooner than their typical 30-second interval.
  */
  const debouncedRefetchLinodeStats = React.useRef(
    debounce(1500, false, () => {
      refetchLinodeStats();
    })
  ).current;

  React.useEffect(() => {
    debouncedRefetchLinodeStats();
  }, [windowWidth, windowHeight, debouncedRefetchLinodeStats]);

  const renderCPUChart = () => {
    const data = stats?.data.cpu ?? [];

    const metrics = getMetrics(data);

    return (
      <LineGraph
        ariaLabel="CPU Usage Graph"
        timezone={timezone}
        chartHeight={chartHeight}
        showToday={rangeSelection === '24'}
        data={[
          {
            borderColor: 'transparent',
            backgroundColor: theme.graphs.cpu.percent,
            data,
            label: 'CPU %',
          },
        ]}
        legendRows={[
          {
            legendTitle: 'CPU %',
            legendColor: 'blue',
            data: metrics,
            format: formatPercentage,
          },
        ]}
      />
    );
  };

  const renderDiskIOChart = () => {
    const data = {
      io: stats?.data.io.io ?? [],
      swap: stats?.data.io.swap ?? [],
    };

    return (
      <LineGraph
        ariaLabel="Disk IO Graph"
        timezone={timezone}
        chartHeight={chartHeight}
        showToday={rangeSelection === '24'}
        data={[
          {
            borderColor: 'transparent',
            backgroundColor: theme.graphs.diskIO.read,
            data: data.io,
            label: 'I/O Rate',
          },
          {
            borderColor: 'transparent',
            backgroundColor: theme.graphs.diskIO.swap,
            data: data.swap,
            label: 'Swap Rate',
          },
        ]}
        legendRows={[
          {
            data: getMetrics(data.io),
            format: formatNumber,
          },
          {
            data: getMetrics(data.swap),
            format: formatNumber,
          },
        ]}
      />
    );
  };

  if (!linodeId) {
    return null;
  }

  if (areStatsNotReady) {
    return (
      <Paper>
        <ErrorState
          CustomIcon={PendingIcon}
          CustomIconStyles={{ width: 64, height: 64 }}
          errorText={
            <>
              <div>
                <Typography variant="h2" className={classes.emptyText}>
                  {STATS_NOT_READY_MESSAGE}
                </Typography>
              </div>
              <div>
                <Typography variant="body1" className={classes.emptyText}>
                  CPU, Network, and Disk stats will be available shortly
                </Typography>
              </div>
            </>
          }
        />
      </Paper>
    );
  }

  if (statsErrorString && !areStatsNotReady) {
    return (
      <Paper>
        <ErrorState
          CustomIconStyles={{ width: 64, height: 64 }}
          errorText={statsErrorString}
        />
      </Paper>
    );
  }

  const chartProps: ChartProps = {
    loading: isLoading,
    height: chartHeight,
    timezone,
    rangeSelection,
  };

  return (
    <Paper>
      <Grid container className={`${classes.root} m0`}>
        <Grid item className={`${classes.graphControls} p0`} xs={12}>
          <Select
            options={options}
            defaultValue={options[0]}
            onChange={handleChartRangeChange}
            name="chartRange"
            id="chartRange"
            small
            label="Select Time Range"
            hideLabel
            className={classes.chartSelect}
            isClearable={false}
          />
        </Grid>
        {!isBareMetalInstance ? (
          <Grid container item xs={12} className={`${classes.graphGrids} p0`}>
            <Grid item className={classes.grid} xs={12}>
              <StatsPanel
                title="CPU (%)"
                renderBody={renderCPUChart}
                {...chartProps}
              />
            </Grid>
            <Grid item className={classes.grid} xs={12}>
              <StatsPanel
                title="Disk IO (blocks/s)"
                renderBody={renderDiskIOChart}
                {...chartProps}
              />
            </Grid>
          </Grid>
        ) : null}
        <NetworkGraph stats={stats} {...chartProps} />
      </Grid>
    </Paper>
  );
};

export default LinodeSummary;
