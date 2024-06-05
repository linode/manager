import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { DateTime } from 'luxon';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { debounce } from 'throttle-debounce';

import PendingIcon from 'src/assets/icons/pending.svg';
import { AreaChart } from 'src/components/AreaChart/AreaChart';
import {
  CPUTimeData,
  DiskIOTimeData,
  Point,
} from 'src/components/AreaChart/types';
import { Box } from 'src/components/Box';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import {
  STATS_NOT_READY_API_MESSAGE,
  STATS_NOT_READY_MESSAGE,
  useLinodeStats,
  useLinodeStatsByDate,
} from 'src/queries/linodes/stats';
import { useProfile } from 'src/queries/profile/profile';
import { setUpCharts } from 'src/utilities/charts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  formatNumber,
  formatPercentage,
  getMetrics,
} from 'src/utilities/statMetrics';

import { getDateOptions } from './helpers';
import { NetworkGraphs } from './NetworkGraphs';
import { StatsPanel } from './StatsPanel';

import type { ChartProps } from './NetworkGraphs';

setUpCharts();

interface Props {
  isBareMetalInstance: boolean;
  linodeCreated: string;
}

const chartHeight = 160;
const rechartsHeight = 300;

const LinodeSummary: React.FC<Props> = (props) => {
  const { isBareMetalInstance, linodeCreated } = props;
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);
  const theme = useTheme();

  const { data: profile } = useProfile();
  const timezone = profile?.timezone || DateTime.local().zoneName;

  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const options = getDateOptions(linodeCreated);
  const [rangeSelection, setRangeSelection] = React.useState('24');
  const [year, month] = rangeSelection.split(' ');

  const isLast24Hours = rangeSelection === '24';

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
    refetch: refetchLinodeStats,
  } = useLinodeStats(id, isLast24Hours, linodeCreated);

  const {
    data: statsByDateData,
    error: statsByDateError,
    isLoading: statsByDateLoading,
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

  /**
   * This changes the X-Axis tick labels depending on the selected timeframe.
   *
   * This is important because the X-Axis should show dates instead of times
   * when viewing many days' worth of stats.
   *
   * @example 'hh a' renders '11am'
   * @example 'LLL dd' renders 'Feb 14'
   */
  const xAxisTickFormat = isLast24Hours ? 'hh a' : 'LLL dd';

  const renderCPUChart = () => {
    const data = stats?.data.cpu ?? [];
    const metrics = getMetrics(data);

    const timeData = data.reduce((acc: CPUTimeData[], point: Point) => {
      acc.push({
        'CPU %': point[1],
        timestamp: point[0],
      });
      return acc;
    }, []);

    return (
      <Box marginLeft={-4} marginTop={2}>
        <AreaChart
          areas={[
            {
              color: theme.graphs.cpu.percent,
              dataKey: 'CPU %',
            },
          ]}
          legendRows={[
            {
              data: metrics,
              format: formatPercentage,
              legendColor: 'blue',
              legendTitle: 'CPU %',
            },
          ]}
          xAxis={{
            tickFormat: xAxisTickFormat,
            tickGap: 60,
          }}
          ariaLabel="CPU Usage Graph"
          data={timeData}
          height={rechartsHeight}
          showLegend
          timezone={timezone}
          unit={'%'}
        />
      </Box>
    );
  };

  const renderDiskIOChart = () => {
    const data = {
      io: stats?.data.io.io ?? [],
      swap: stats?.data.io.swap ?? [],
    };
    const timeData: DiskIOTimeData[] = [];

    for (let i = 0; i < data.io.length; i++) {
      timeData.push({
        'I/O Rate': data.io[i][1],
        'Swap Rate': data.swap[i][1],
        timestamp: data.io[i][0],
      });
    }

    return (
      <Box marginLeft={-4} marginTop={2}>
        <AreaChart
          areas={[
            {
              color: theme.graphs.diskIO.read,
              dataKey: 'I/O Rate',
            },
            {
              color: theme.graphs.diskIO.swap,
              dataKey: 'Swap Rate',
            },
          ]}
          legendRows={[
            {
              data: getMetrics(data.io),
              format: formatNumber,
              legendColor: 'yellow',
              legendTitle: 'I/O Rate',
            },
            {
              data: getMetrics(data.swap),
              format: formatNumber,
              legendColor: 'red',
              legendTitle: 'Swap Rate',
            },
          ]}
          xAxis={{
            tickFormat: xAxisTickFormat,
            tickGap: 60,
          }}
          ariaLabel="Disk I/O Graph"
          data={timeData}
          height={342}
          showLegend
          timezone={timezone}
          unit={' blocks/s'}
        />
      </Box>
    );
  };

  if (!linodeId) {
    return null;
  }

  if (areStatsNotReady) {
    return (
      <Paper>
        <ErrorState
          errorText={
            <>
              <div>
                <StyledTypography variant="h2">
                  {STATS_NOT_READY_MESSAGE}
                </StyledTypography>
              </div>
              <div>
                <StyledTypography variant="body1">
                  CPU, Network, and Disk stats will be available shortly
                </StyledTypography>
              </div>
            </>
          }
          CustomIcon={PendingIcon}
          CustomIconStyles={{ height: 64, width: 64 }}
        />
      </Paper>
    );
  }

  if (statsErrorString && !areStatsNotReady) {
    return (
      <Paper>
        <ErrorState
          CustomIconStyles={{ height: 64, width: 64 }}
          errorText={statsErrorString}
        />
      </Paper>
    );
  }

  const chartProps: ChartProps = {
    height: chartHeight,
    loading: isLoading,
    rangeSelection,
    timezone,
  };

  return (
    <Grid container sx={{ margin: 0, width: '100%' }}>
      <Grid
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: theme.spacing(2),
          marginTop: theme.spacing(),
          padding: 0,
        }}
        xs={12}
      >
        <StyledSelect
          defaultValue={options[0]}
          hideLabel
          id="chartRange"
          isClearable={false}
          label="Select Time Range"
          name="chartRange"
          onChange={handleChartRangeChange}
          options={options}
          small
        />
      </Grid>
      {!isBareMetalInstance ? (
        <Grid
          sx={{
            flexWrap: 'nowrap',
            margin: 0,
            [theme.breakpoints.down(1100)]: {
              flexWrap: 'wrap',
            },
          }}
          container
          spacing={4}
          xs={12}
        >
          <StyledGrid xs={12}>
            <StatsPanel
              renderBody={renderCPUChart}
              title="CPU (%)"
              {...chartProps}
            />
          </StyledGrid>
          <StyledGrid xs={12}>
            <StatsPanel
              renderBody={renderDiskIOChart}
              title="Disk I/O (blocks/s)"
              {...chartProps}
            />
          </StyledGrid>
        </Grid>
      ) : null}
      <NetworkGraphs
        stats={stats}
        xAxisTickFormat={xAxisTickFormat}
        {...chartProps}
      />
    </Grid>
  );
};

const StyledSelect = styled(Select, { label: 'StyledSelect' })({
  maxWidth: 150,
});

const StyledGrid = styled(Grid, {
  label: 'StyledGrid',
})(({ theme }) => ({
  '& h2': {
    fontSize: '1rem',
  },
  '&.MuiGrid-item': {
    padding: theme.spacing(2),
  },
  backgroundColor: theme.bg.white,
  border: `solid 1px ${theme.borderColors.divider}`,
  marginBottom: theme.spacing(2),
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  [theme.breakpoints.up(1100)]: {
    '&:first-of-type': {
      marginRight: theme.spacing(2),
    },
  },
}));

const StyledTypography = styled(Typography, { label: 'StyledTypography' })(
  ({ theme }) => ({
    marginTop: theme.spacing(),
    textAlign: 'center',
  })
);

export default LinodeSummary;
