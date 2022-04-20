import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import LineGraph from 'src/components/LineGraph';
import NetworkGraph, { ChartProps } from './NetworkGraphs';
import PendingIcon from 'src/assets/icons/pending.svg';
import ErrorState from 'src/components/ErrorState';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { DateTime } from 'luxon';
import { useParams } from 'react-router-dom';
import { useProfile } from 'src/queries/profile';
import { setUpCharts } from 'src/utilities/charts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getDateOptions } from './helpers';
import { StatsPanel } from './StatsPanel';
import {
  useLinodeStatsByDate,
  useLinodeStats,
  STATS_NOT_READY_MESSAGE,
  STATS_NOT_READY_API_MESSAGE,
} from 'src/queries/linodes';
import {
  formatNumber,
  formatPercentage,
  getMetrics,
} from 'src/utilities/statMetrics';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from 'src/components/core/styles';

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

  const options = getDateOptions(linodeCreated);
  const [rangeSelection, setRangeSelection] = React.useState('24');
  const [year, month] = rangeSelection.split(' ');

  const isLast24Hours = rangeSelection === '24';

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
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

  const renderCPUChart = () => {
    const data = stats?.data.cpu ?? [];

    const metrics = getMetrics(data);

    return (
      <LineGraph
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
                  Stats for this Linode are not yet available
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
